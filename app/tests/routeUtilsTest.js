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
    it('should pass in rosy scenario', function(done) {
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
        const routeService = require('../services/routeUtils')(mockRedisService, fakeApiCli);
        let p = routeService.getShortestRoute(token, INPUT)
            .then(function(result) {
                let solution = mockRedisService.updateToken.getCall(0)
                    .args[1];
                assert('success', solution.status);
                assert(11268, solution.total_distance);
                assert('[[22.271829,114.16307],[22.265556,114.163442],[22.267377,114.151866]]', JSON.stringify(solution.path))
                done();
            })
            .catch(done);
    });
});
