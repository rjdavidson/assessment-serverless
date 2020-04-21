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
        app.generateOutput({'temperature': 14.5}, function(error, result) {
            expect(result).to.be.an('object');
            expect(result.statusCode).to.equal(200)
            expect(result.body).to.be.an('string');

            let response = JSON.parse(result.body)
            expect(response['temperature']).to.equal(14.5)
        });
    });
});
