# Sde Usage Getter

## Installation

- conda create --clone arcgispro-py3 --name sde-usage-getter
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
  - place it in `sde-usage-getter/src/usage/service_account.json`

## Usage

```sh
    activate sde-usage-getter
    cd sde-usage-getter/src
    python -m usage get
    python -m usage truncate
```
