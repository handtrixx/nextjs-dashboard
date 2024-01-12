#!/bin/bash

# Log file location
LOG_FILE=/usr/src/app/app.log

rm -R /usr/src/app/node_modules/

# Start your Node.js application
npm install --no-progress
npm run dev 

# Keep the script running in case of errors to be able to inspect the container
tail -f /dev/null