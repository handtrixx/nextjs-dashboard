#!/bin/bash

echo Installing node modules from package.json
npm install --no-progress
echo Create DB schema and example data if not exisiting
npm run seed
echo genrate / update ts db scheme
npx kysely-codegen --url "env(POSTGRES_URL)" --out-file "./app/lib/db.d.ts"
echo Starting your Node.js application
npm run dev 

# Keep the script running in case of errors to be able to inspect the container
tail -f /dev/null