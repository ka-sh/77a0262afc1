/**
 * Test route utils functionality
 */
const assert = require('assert');
const sinon = require('sinon');
const Promise = require('bluebird');
const fs = require('fs');
const INPUT = destinations = [
    [22.275820, 114.155968],
    [22.271829, 114.163070],
    [22.267377, 114.151866],
    [22.265556, 114.163442]
];


describe('Testing route service ', function() {
    it('should pass in rosy scenario', function() {
        let token = "Test Token";
        let fakeApiCli = {
            distanceMatrix: function() {
                return {
                    asPromise: sinon.stub()
                        .resolves(JSON.parse(fs.readFileSync('./tests/resources/responses/googleResRosy.json'), 'utf8'))
                }
            }
        };
        let mockRedisService = require('../services/redisService')(sinon.mock());
        let stubUpdateToken = sinon.stub(mockRedisService, 'updateToken')
            .usingPromise(Promise)
            .resolves("mock success");
        mockRedisService.mockedT = true;
        const routeService = require('../services/routeUtils')(mockRedisService, fakeApiCli);
        routeService.getShortestRoute(token, INPUT);
    });

});
