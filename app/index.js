const express = require('express');
const app = express();
const uuid = require('uuid');
const redis = require('./services/redis');

app.get('/route/:token', function(req, res) {
    //TODO:validate token string
    redis.getToken(req.params.token)
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
    //TODO:Validate destinations
    let key;
    let desintations = req.query.destinations;
    redis.generateToken()
        .then((token) => {
            key = token;
            res.send(token);
        }, (err) => {
            console.error("Error while generating token", err);
        });
    //TODO:Build cost matrix
    //TODO:Calculate shortest route
    //TODO:update results in redis
    // res.send(req.query.destinations)
});

app.listen(8080, function() {
    console.log('App is running');
})
