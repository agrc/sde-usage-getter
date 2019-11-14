/**
 * This function should be registered to bucket events on deploy
 * See: https://cloud.google.com/functions/docs/calling/storage
 * deploy with: gcloud functions deploy sgidStatsToBigQuery --runtime nodejs6 --trigger-resource sgid_stats --trigger-event google.storage.object.finalize
 * @param {object} event The Cloud Functions event.
 * @param {function} callback The callback function.
 */
exports.sgidStatsToBigQuery = (event, callback) => {
  const file = event.data;
  const bqDataset = 'sgid_stats';
  const tableName = 'locks';
  const project = 'agrc-204220';


  console.log(`  Event ${event.eventId}`);
  console.log(`  Event Type: ${event.eventType}`);
  console.log(`  Bucket: ${file.bucket}`);
  console.log(`  File: ${file.name}`);
  console.log(`  Metageneration: ${file.metageneration}`);
  console.log(`  Created: ${file.timeCreated}`);
  console.log(`  Updated: ${file.updated}`);
  const Storage = require('@google-cloud/storage');
  const BigQuery = require('@google-cloud/bigquery');
  const bigquery = new BigQuery();
  const dataset = bigquery.dataset(bqDataset); // Dataset must already exist in BigQuery
  const table = dataset.table(tableName);

  // see all load job options: https://cloud.google.com/bigquery/docs/reference/rest/v2/jobs#configuration.load
  const metadata = {
    sourceFormat: 'CSV',
    skipLeadingRows: 0,
    // schema: json of table schema
    schema: {
        fields: [
            {
                "description": "Soft shared locks vs exclusive locks",
                "mode": "NULLABLE",
                "name": "lock_type",
                "type": "STRING"
            },
            {
                "description": "Time lock was created in UTC",
                "mode": "NULLABLE",
                "name": "lock_time",
                "type": "DATETIME"
            },
            {
                "description": "SGID table name",
                "mode": "NULLABLE",
                "name": "table_name",
                "type": "STRING"
            },
            {
                "description": "User in connection string",
                "mode": "NULLABLE",
                "name": "owner",
                "type": "STRING"
            },
            {
                "description": "Node the lock is coming from",
                "mode": "NULLABLE",
                "name": "nodename",
                "type": "STRING"
            }
        ]
    },

    // Set the write disposition to append to an existing table.
    writeDisposition: 'WRITE_APPEND',
    createDisposition: "CREATE_IF_NEEDED"
  };

  const storage = new Storage({
    projectId: project // GCP project id
  });
  const data = storage.bucket(file.bucket).file(file.name);
  // WARNING this load job does not poll for job completion in order to limit function run time
  // Load job errors must be discovered from Stackdriver or the BigQuery api.
  table.createLoadJob(data, metadata,
      function(err, job) {
      if (err) {
        console.error("Something went wrong with submitting the BigQuery job. Error: ", err);
        callback();
      }
      else{
      console.log("BigQuery job successfully submitted");
      callback();
    }
    });
};
