"use strict";

const MongoClient = require('mongodb').MongoClient;
const MONGODB_URI = "mongodb+srv://" + process.env.MONGODB_USER + ":" + process.env.MONGODB_PASSW + "@" +
    process.env.MONGODB_URI + "/vopak?retryWrites=true&w=majority"
const moment = require('moment');

let response;

function queryDatabase (db) {
  console.log('=> query database');

  return db.collection('items').find({}).toArray();
}

async function getWeatherItems(client, city) {
    let q = {'city': city}
    return client
        .db()
        .collection('weather')
        .find(q, {
            "limit": 1,
            "sort": [
                ['ts', 'desc']
            ]
        })
        .toArray();
}

exports.lambdaHandler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;
    let db = await MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true });
    let items = await getWeatherItems(db, 'Covilha');

    response = {
        statusCode: 200,
        body: JSON.stringify({
            temperature: items[0].temperature,
            current_dt: moment().format(),
        }),
    };

    return response

  // connectToDatabase(MONGODB_URI)
  //   .then(db => queryDatabase(db))
  //   .then(result => {
  //     console.log('=> returning result: ', result);
  //     callback(null, result);
  //   })
  //   .catch(err => {
  //     console.log('=> an error occurred: ', err);
  //     callback(err);
  //   });
};

/**
 *
 * Event doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html#api-gateway-simple-proxy-for-lambda-input-format
 * @param {Object} event - API Gateway Lambda Proxy Input Format
 *
 * Context doc: https://docs.aws.amazon.com/lambda/latest/dg/nodejs-prog-model-context.html 
 * @param {Object} context
 *
 * Return doc: https://docs.aws.amazon.com/apigateway/latest/developerguide/set-up-lambda-proxy-integrations.html
 * @returns {Object} object - API Gateway Lambda Proxy Output Format
 * 
 */
// exports.lambdaHandler = async (event, context) => {
//
//     // try {
//         const mongoUri = "mongodb+srv://" + process.env.MONGODB_USER + ":" + process.env.MONGODB_PASSW + "@" +
//             process.env.MONGODB_URI + "/test?retryWrites=true&w=majority"
//
//         const client = new MongoClient(mongoUri, { useNewUrlParser: true });
//         client.connect(err => {
//             if (err) {
//                 console.error(err)
//             }
//             const collection = client.db("vopak").collection("weather");
//             console.log('test')
//             console.log(collection)
//             // perform actions on the collection object
//             client.close();
//             response = {
//                 'statusCode': 200,
//                 'body': JSON.stringify({
//                     message: 'current temperature',
//                     timestamp: moment().format()
//                 })
//             }
//
//             return response
//         });
//     // } catch (err) {
//     //     console.log(err);
//     //     return err;
//     // }
// };
