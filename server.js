'use strict';

const express = require('express');
const router = express.Router();
const bodyParser = require('body-parser');
const app = express().use(bodyParser.json());

require('dotenv').config();

var server = app.listen(4001, function () {
    var host = 'localhost';
    var port = server.address().port;
    console.log('Webhook is listening on http://' + host + ':' + port)
});

const averageTempLambda = require('./avg-temp/app');
const currentTempLambda = require('./current-temp/app');

router.get('/avgtempinsfax', (req, res) => {
    averageTempLambda.lambdaHandler(req, [], function(error, response) {
        res.status(response.statusCode).set({'Content-Type': 'application/json'}).send(response.body)
    });
});

router.get('/currenttempincovilha', (req, res) => {
    currentTempLambda.lambdaHandler(req, [], function(error, response) {
        res.status(response.statusCode).set({'Content-Type': 'application/json'}).send(response.body)
    });
});

app.use('/', router);
