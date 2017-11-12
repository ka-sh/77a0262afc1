const express = require('express');
const app = express();
const uuid = require('uuid');
const clientFactory = require('./services/clientFactory');
const redisService = require('./services/redisService')(clientFactory.getRedisCli());
const routeUtils = require('./services/routeUtils')(redisService, clientFactory.getGoogleApiCli());
const bodyParser = require('body-parser');
const validator = require('./utils/validator');
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({
    extended: false
}));
// parse application/json
app.use(bodyParser.json());

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
    let destMatrix;
    try {
        destMatrix = validator.isValidInput(req.body.destinations);
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
        res.status(400)
            .send({
                status: 'failure',
                error: ex.toString()
            });
    }
});

// app.get('/', function(req, res) {
//     let validation = validateAndParseInput(req.query.destinations);
//     if (validation.valid) {
//         redisService.generateToken()
//             .then(function(token) {
//                 res.send({
//                     token: token
//                 });
//                 return routeUtils.getShortestRoute(token, validation.array)
//             })
//             .then(function(results) {
//                 console.log("Request processed successfully");
//             })
//             .catch(function(err) {
//                 console.error('failed to process request ', err);
//             });
//     } else {
//         res.send({
//             error: validation.err
//         });
//     }
// });
//

app.listen(8080, function() {
    console.log('App is running');
})
