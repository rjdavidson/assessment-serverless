'use strict';

const app = require('../../app.js');
const chai = require('chai');
const expect = chai.expect;
var event, context, callback;

describe('Tests index', function () {
    it('verifies successful response', async () => {
        console.log('test');
        const result = app.lambdaHandler(event, [], function(response){console.log('test')})

        expect(result).to.be.an('object');
        expect(result.statusCode).to.equal(200);
        expect(result.body).to.be.an('string');

        let response = JSON.parse(result.body);

        expect(response).to.be.an('object');
        expect(response.message).to.be.equal("hello world");
        // expect(response.location).to.be.an("string");
    });
});
