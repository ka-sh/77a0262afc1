const express = require('express');
const app = express();
const uuid = require('uuid');
const clientFactory = require('./services/clientFactory');
const redisService = require('./services/redisService')(clientFactory.getRedisCli());
const routeUtils = require('./services/routeUtils')(redisService, clientFactory.getGoogleApiCli());

app.get('/route/:token', function(req, res) {
    //TODO:validate token string
    redisService.getToken(req.params.token)
        .then(function(result) {
            if (result !== null) {
                res.send(result);
            } else {
                res.send({
                    error: "Token doesn't exist."
                });
            }
        })
        .catch(function(err) {
            res.send({
                error: 'Failed to fetch token'
            });
        });
});
app.post('/', function(req, res) {

})
app.get('/', function(req, res) {
    let validation = validateAndParseInput(req.query.destinations);
    if (validation.valid) {
        redisService.generateToken()
            .then(function(token) {
                res.send({
                    token: token
                });
                return routeUtils.getShortestRoute(token, validation.array)
            })
            .then(function(results) {
                console.log("Request processed successfully");
            })
            .catch(function(err) {
                console.error('failed to process request ', err);
            });
    } else {
        res.send({
            error: validation.err
        });
    }
});


app.listen(8080, function() {
    console.log('App is running');
})
