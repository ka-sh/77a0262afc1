const express = require('express');
const app = express();
const redis = require('redis');
const uuid = rquire('uuid');
var client = redis.createClient('6379', 'redis');

app.get('/route/:token', function(req, res) {
    res.send(req.params.token);
    /**
     * TODO:Implement token  handling logic
     */
});

app.get('/:destinations', function(req, res) {

    res.send(req.params.destinations)
})

app.listen(8080, function() {
    console.log('App is running');
})
