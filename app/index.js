const express = require('express');
const app = express();
const uuid = require('uuid');
const redis = require('./services/redis');

app.get('/route/:token', function(req, res) {
    redis.generateToken()
        .then((token) => {
            res.send(token);
        }, (err) => {
            console.error("Error while generating token", err);
        });
});

// app.get('/:destinations', function(req, res) {
//     res.send(req.params.destinations)
// })

app.listen(8080, function() {
    console.log('App is running');
})
