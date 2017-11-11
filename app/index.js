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
