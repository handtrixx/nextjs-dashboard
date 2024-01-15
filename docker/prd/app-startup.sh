#!/bin/bash

echo Installing node modules from package.json
npm install --no-progress
echo Building your Node.js application
npm run build
echo Starting your Node.js application
npm run start

# Keep the script running in case of errors to be able to inspect the container
tail -f /dev/null