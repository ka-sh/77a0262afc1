const Promise = require('bluebird');
const DISTANCE_MATRIX_KEY = 'AIzaSyDwlirBm11mXCa1XMybii6dPLWpIwblmsE';
const googleAPIclient = require('@google/maps')
    .createClient({
        key: DISTANCE_MATRIX_KEY,
        Promise: Promise
    });

const redis = require('redis');
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);
const redisClient = redis.createClient({
    host: "redis",
    port: 6379
});
redisClient.onAsync('connect')
    .then(function(resolve) {
        console.log("Connected to redis successfully");
    });

console.log("Initializing clients...");
module.exports = (function() {
    return {
        getGoogleApiCli: () => googleAPIclient,
        getRedisCli: () => redisClient
    };
})();
