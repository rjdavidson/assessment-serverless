"use strict";

const MongoClient = require('mongodb').MongoClient;
const MONGODB_URI = "mongodb+srv://" +
    process.env.MONGODB_USER +
    ":" +
    process.env.MONGODB_PASSW +
    "@" +
    process.env.MONGODB_URI +
    "/vopak?retryWrites=true&w=majority"
const q = {'city': 'Covilha', 'country': 'Portugal'}
const moment = require('moment');

let cachedDb;
let response;

/**
 * Connect to Mongo.
 *
 * @param uri
 *
 * @returns {Promise<unknown>|Promise<MongoClient>}
 */
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

/**
 * Retrieve most recent item from the "weather" collection, filtered by q.
 *
 * @param client
 * @param q
 *
 * @returns {Promise<T>}
 */
function getMostRecentWeatherItem(client, q) {
  return client.db().collection('weather')
        .find(q, {
            "limit": 1,
            "sort": [
                ['ts', 'desc']
            ]
        })
        .project({ temperature: 1, _id: 0 })
        .toArray()
    .then(result => {
        return result[0]
    }).catch(err => {
        return false
    });
}

exports.generateOutput = (result, callback) => {
    if (!result) {
        response = {
            statusCode: 404,
            body: JSON.stringify(({
                message: 'Could not find weather items',
                q: q,
                current_dt: moment().format(),
            }))
        }
        return callback(null, response)
    }
    response = {
        statusCode: 200,
        body: JSON.stringify({
            temperature: result.temperature,
            current_dt: moment().format(),
        }),
    };
    callback(null, response)
}

/**
 * Lambda handler.
 *
 * @param event
 * @param context
 * @param callback
 */
exports.lambdaHandler = (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    connectToDatabase(MONGODB_URI)
    .then(db => getMostRecentWeatherItem(db, q))
    .then(result => exports.generateOutput(result, callback))
    .catch(err => {
      console.log('=> an error occurred: ', err);
      callback(err);
    });
};
