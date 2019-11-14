#!/usr/bin/env python
# * coding: utf8 *
'''Sde Usage Getter.

Usage:
    usage get
    usage truncate
'''

import csv
import os
from datetime import date

import pyodbc
from docopt import docopt
from dotenv import load_dotenv
from google.cloud import storage

load_dotenv()


def format_connection_string(secrets):
    return f"DRIVER=ODBC Driver 17 for SQL Server;SERVER={secrets['server']}DATABASE=SGID10;UID={secrets['username']};PWD={secrets['password']}"


def get_output_file():
    script_dir = os.path.dirname(__file__)

    return os.path.join(script_dir, str(date.today()) + '.csv')


def upload_blob(bucket_name, source_file_name, destination_blob_name):
    '''Uploads a file to the bucket.
    '''
    storage_client = storage.Client.from_service_account_json('service_account.json')
    bucket = storage_client.get_bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)

    blob.upload_from_filename(source_file_name)

    print(f'File {source_file_name} uploaded to {destination_blob_name}.')


if __name__ == '__main__':
    args = docopt(__doc__, version='sde usage getter v1.0.0')

    secrets = {'server': os.getenv('SUG_HOST'), 'username': os.getenv('SUG_USER'), 'password': os.getenv('SUG_PW')}
    connection_string = format_connection_string(secrets)
    out_file = get_output_file()

    if args['get']:
        command = 'SELECT * FROM sde.LockLogs;'

        connection = pyodbc.connect(connection_string)
        cursor = connection.cursor()
        print('connected')

        cursor.execute(command)

        print(f'writing data to {out_file}')
        with open(out_file, 'w', newline='') as f:
            csv.writer(f, quoting=csv.QUOTE_NONE).writerows(cursor)

        connection.close()

        print('uploading to cloud bucket')
        upload_blob('sgid_stats', out_file, f'{str(date.today())}.csv')

        print('done')
    if args['truncate']:
        command = 'TRUNCATE TABLE sde.LockLogs;'

        connection = pyodbc.connect(connection_string)
        cursor = connection.cursor()
        print('connected')

        print(f'truncating sde.lockslog: {out_file}')
        cursor.execute(command)
        cursor.commit()
        connection.close()

        print('done')
