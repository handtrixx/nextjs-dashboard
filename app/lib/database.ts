import dotenv from 'dotenv';
import {
  Kysely,
  PostgresDialect,
  SqliteDialect,
  MssqlDialect,
  MysqlDialect,
} from 'kysely';
import { DB } from 'kysely-codegen';
import { Pool } from 'pg';
import { createPool } from 'mysql2';
import * as SQLite from 'better-sqlite3';
import * as tedious from 'tedious';
import * as tarn from 'tarn';

const dbType = process.env.DB_TYPE;

switch (dbType) {
  case 'MYSQL':
    var dialect = new MysqlDialect({
      pool: createPool({
        database: process.env.MYSQL_DB,
        host: process.env.MYSQL_HOST,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        port: process.env.MYSQL_PORT,
        connectionLimit: 10,
      }),
    });
    break;
  case 'SQLITE':
    var dialect = new SqliteDialect({
      database: new SQLite(':memory:'),
    });
    break;
  case 'MSSQL':
    var dialect = new MssqlDialect({
      tarn: {
        ...tarn,
        options: {
          min: 0,
          max: 10,
        },
      },
      tedious: {
        ...tedious,
        connectionFactory: () =>
          new tedious.Connection({
            authentication: {
              options: {
                password: 'password',
                userName: 'username',
              },
              type: 'default',
            },
            options: {
              database: 'some_db',
              port: 1433,
              trustServerCertificate: true,
            },
            server: 'localhost',
          }),
      },
    });
    break;
  default:
  case 'PSQL':
    var dialect = new PostgresDialect({
      pool: new Pool({
        database: process.env.POSTGRES_DB,
        host: process.env.POSTGRES_HOST,
        user: process.env.POSTGRES_USER,
        password: process.env.POSTGRES_PASSWORD,
        port: process.env.POSTGRES_PORT,
        max: 10,
      }),
    });
    break;
}

export const db = new Kysely<DB>({
  dialect,
});
