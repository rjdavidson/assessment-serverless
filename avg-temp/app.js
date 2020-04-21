"use strict";

const MongoClient = require('mongodb').MongoClient;
const MONGODB_URI = "mongodb+srv://" +
    process.env.MONGODB_USER +
    ":" +
    process.env.MONGODB_PASSW +
    "@" +
    process.env.MONGODB_URI +
    "/vopak?retryWrites=true&w=majority"
const moment = require('moment');
const q = {'city': 'Sfax', 'country': 'Tunisia'}

let cachedDb;
let response;

/**
 * Connect to Mongo.
 *
 * @param uri
 *
 * @returns {Promise<unknown>|Promise<MongoClient>}
 */
function connectToDatabase(uri) {
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
function getAverageWeather(client, q) {
    return client.db().collection('weather')
        .aggregate([
            {
                $match: q
            },
            {
                $group: {
                    _id: null,
                    averageTemp: {
                        $avg: "$temperature"
                    }
                }
            }
        ])
        .toArray()
        .then(result => {
            return result[0]
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
        callback(null, response)
    } else {
        response = {
            statusCode: 200,
            body: JSON.stringify({
                avg_temperature: result.averageTemp,
                current_dt: moment().format(),
            }),
        };
        callback(null, response);
    }
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
    console.log(MONGODB_URI)
    connectToDatabase(MONGODB_URI)
        .then(db => getAverageWeather(db, q))
        .then(result => exports.generateOutput(result, callback))
        .catch(err => {
            console.log('=> an error occurred: ', err);
            callback(err);
        });
};
