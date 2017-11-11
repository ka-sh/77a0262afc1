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
        });
});

app.get('/', function(req, res) {
    let key = "Test token";
    let validation = validateAndParseInput(req.query.destinations);
    if (validation.valid) {
        routeUtils.getShortestRoute(key, validation.array)
        res.send({
            token: key
        });
    } else {
        res.send({
            error: validation.err
        });
    }
    // routeUtils.getShortestRoute(key, destinations);
    // redis.generateToken()
    //     .then((token) => {
    //         key = token;
    //         res.send(token);
    //     }, (err) => {
    //         console.error("Error while generating token", err);
    //     });
    //TODO:Build cost matrix
    //TODO:Calculate shortest route
    //TODO:update results in redis
    // res.send(req.query.destinations)
});

/**
 *  Validate and parse the input
 *  Return validation object
 * @return {valid:Boolean, err:String, array:Array}
 */
function validateAndParseInput(input) {
    let array = [];
    let result = {
        valid: false,
        err: null,
        array: undefined
    };
    /**
     * Max size is 1024
     */
    if (input.length > 1024) {
        result.err = "Input length exceeds Max";
        return result;
    }
    /**
     * Invalid input string
     */
    try {
        array = JSON.parse(input);
        if (!Array.isArray(array)) {
            throw new Error('Not an Array');
        }
    } catch (ex) {
        result.err = "Invalid input";
        return result;
    }
    /**
     * Invalid coordinate value
     */
    for (let i = 0; i < array.length; i++) {
        try {
            array[i] = [parseFloat(array[i][0]), parseFloat(array[i][1])];

            if (isNaN(array[i][0]) || isNaN(array[i][1])) {
                result.err = 'invalid coordinate value';
                return result;
            }
        } catch (ex) {
            result.err = 'invalid coordinate value';
            return result;
        }

    }

    return {
        valid: true,
        array: array
    }
}


app.listen(8080, function() {
    console.log('App is running');
})
