# Sde Usage Getter

A MSSQL trigger writes a record to a table when a lock is created. There is a google cloud bucket that stores csv's generated by the usage cli. Finally, there is a cloud function hooked up to the storage event that imports the data to big query.

- [loading data into cloud storage and big query tutorial](https://cloud.google.com/bigquery/docs/loading-data-cloud-storage-csv)
- [sample repo](https://github.com/GoogleCloudPlatform/nodejs-docs-samples)

## Installation

- conda create --name sde-usage-getter python=3.7
- activate sde-usage-getter
- conda install docopt pyodbc
- pip install -r requirements.txt

## Configuration

- create `sde-usage-getter/src/usage/.env`
- populate values

   ```yml
    SUG_HOST=
    SUG_USER=
    SUG_PW=
    ```

- create service account with bucket write permissions
  - place it in `sde-usage-getter/src/service_account.json`

## Usage

```sh
    activate sde-usage-getter
    cd sde-usage-getter/src
    python -m usage get
    python -m usage truncate
```

## Cloud function deployment

`gcloud functions deploy sgidStatsToBigQuery --runtime nodejs12 --trigger-resource sgid_stats --trigger-event google.storage.object.finalize --source ./cloud-function`
