'use strict';

const app = require('../../app.js');
const chai = require('chai');
const expect = chai.expect;
var event, context, callback;

describe('Tests index', function () {
    it('verifies successful 404 response', async () => {
        app.generateOutput(null, function(error, result) {
            expect(result).to.be.an('object');
            expect(result.statusCode).to.equal(404)
            expect(result.body).to.be.an('string');

            let response = JSON.parse(result.body)
            expect(response.message).to.equal('Could not find weather items')
        });
    });

    it('verifies successful response', async () => {
        app.generateOutput({'averageTemp': 20.2}, function(error, result) {
            expect(result).to.be.an('object');
            expect(result.statusCode).to.equal(200)
            expect(result.body).to.be.an('string');

            let response = JSON.parse(result.body)
            expect(response['avg_temperature']).to.equal(20.2)
        });
    });
});
