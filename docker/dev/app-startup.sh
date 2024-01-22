#!/bin/bash

echo Installing node modules from package.json
npm install --no-progress
echo Create DB schema and example data if not exisiting
npm run seed
case $DB_TYPE in
  PSQL)   
    export DATABASE_URL="postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST/$POSTGRES_DB"
    ;;
  MYSQL)
    export DATABASE_URL="mysql://$MYSQL_USER:$MYSQL_PASSWORD@$MYSQL_HOST/$MYSQL_DB"
    ;;
  *)
    export DATABASE_URL="postgres://$POSTGRES_USER:$POSTGRES_PASSWORD@$POSTGRES_HOST/$POSTGRES_DB"
    ;;
esac
echo generate / update ts db scheme
npx kysely-codegen --out-file "./app/lib/db.d.ts"
echo Starting your Node.js application
npm run dev

# Keep the script running in case of errors to be able to inspect the container
tail -f /dev/null