#!/bin/bash

COMMIT_HASH=`git rev-parse HEAD`

# cleanup build directory
rm -rf .build/*

# setup build directory structure
mkdir -p .build/code
mkdir -p .build/artifacts

# setup build directory structure for avg-temp
mkdir .build/code/avg-temp
mkdir .build/artifacts/avg-temp

# setup build directory structure for current-temp
mkdir .build/code/current-temp
mkdir .build/artifacts/current-temp

# copy avg-temp lambda
cp ./avg-temp/app.js .build/code/avg-temp/
cp ./avg-temp/package.json .build/code/avg-temp/

# install dependencies and create zip archive
npm install --prefix .build/code/avg-temp --production
cd .build/code/avg-temp; zip -r $COMMIT_HASH.zip *
cd ../../../
mv .build/code/avg-temp/$COMMIT_HASH.zip .build/artifacts/avg-temp

# copy current-temp lambda
cp ./current-temp/app.js .build/code/current-temp/
cp ./current-temp/package.json .build/code/current-temp/

# install dependencies and create zip archive
npm install --prefix .build/code/current-temp --production
cd .build/code/current-temp; zip -r $COMMIT_HASH.zip *
cd ../../../
mv .build/code/current-temp/$COMMIT_HASH.zip .build/artifacts/current-temp

export AWS_PROFILE="assessment-vopak"
export AWS_DEFAULT_REGION=eu-west-1
export S3Bucket="assessment-vopak"

aws s3 cp --recursive .build/artifacts s3://$S3Bucket/code/

