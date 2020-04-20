"use strict";

const MongoClient = require('mongodb').MongoClient;
const MONGODB_URI = "mongodb+srv://" + process.env.MONGODB_USER + ":" + process.env.MONGODB_PASSW + "@" +
    process.env.MONGODB_URI + "/vopak?retryWrites=true&w=majority"
const moment = require('moment');

let cachedDb;
let response;

function connectToDatabase (uri) {
  console.log('=> connect to database');

  if (cachedDb) {
    console.log('=> using cached database instance');
    return Promise.resolve(cachedDb);
  }

  return MongoClient.connect(uri)
    .then(db => {
      cachedDb = db;
      return cachedDb;
    });
}

function getMostRecentWeatherItem(client, q) {
  console.log('=> getMostRecentWeatherItem');

  return client.db().collection('weather')
        .find(q, {
            "limit": 1,
            "sort": [
                ['ts', 'desc']
            ]
        })
        .toArray()
    .then(result => {
        return result
    });
}

exports.lambdaHandler = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    connectToDatabase(MONGODB_URI)
    .then(db => getMostRecentWeatherItem(db, {'city': 'Covilha'}))
    .then(result => {
        response = {
            statusCode: 200,
            body: JSON.stringify({
                temperature: result[0].temperature,
                current_dt: moment().format(),
            }),
        };
      callback(null, response);
    })
    .catch(err => {
      console.log('=> an error occurred: ', err);
      callback(err);
    });
};
