const express = require('express');
const app = express();
const uuid = require('uuid');
const clientFactory = require('./services/clientFactory');
const redisService = require('./services/redisService')(clientFactory.getRedisCli());
const routeUtils = require('./services/routeUtils')(redisService, clientFactory.getGoogleApiCli());
const bodyParser = require('body-parser');
const validator = require('./utils/validator');
const logger = require('winston');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));
// parse application/json
app.use(bodyParser.json());

app.get('/route/:token', function(req, res) {

    //TODO:validate token string
    if (validator.isValidToken(req.params.token)) {
        logger.info(`Received token request for ${req.params.token}`);
        redisService.getToken(req.params.token)
            .then(function(result) {
                if (result !== null) {
                    res.status(200)
                        .send(result);
                } else {
                    logger.warn('Token request for invalid token');
                    res.send({
                        error: "Token doesn't exist."
                    });
                }
            })
            .catch(function(err) {
                logger.error(err);
                res.status(400)
                    .send({
                        error: 'Failed to fetch token'
                    });
            });
    } else {
        logger.warn(`Invalid token request for ${req.params.token}`)
        res.status(400)
            .send({
                status: 'failure',
                error: 'Invalid token'
            });
    }

});

app.post('/', function(req, res) {
    let destMatrix;
    try {
        destMatrix = validator.isValidInput(req.body.destinations);
        logger.info(`request to calculate shortest path for ${destMatrix}`);
        redisService.generateToken()
            .then(function(token) {
                res.status(200)
                    .send({
                        token: token
                    });
                return routeUtils.getShortestRoute(token, destMatrix);
            })
        //TODO:token should be updated here in case of success/failure
        //need to extract logic to this location
    } catch (ex) {
        logger.error(ex);
        res.status(400)
            .send({
                status: 'failure',
                error: ex.toString()
            });
    }
});

app.listen(8080, function() {
    console.log('App is running');
})
