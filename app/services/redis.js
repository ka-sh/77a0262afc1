const redis = require('redis');
const Promise = require('bluebird');
const uuid = require('uuid/v4');
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

function createKey(resolve, reject) {
    let key = uuid();
    redisClient.getAsync(key)
        .then(function(data) {
            if (data == null) {
                resolve(key);
            } else {
                createKey(resolve, reject);
            }
        }, function(reason) {
            reject(reason);
        });
}

module.exports = (function() {
    return {
        getClient: function() {
            return redisClient;
        },
        /**
         * Generate UUID token.
         */
        generateToken: function() {
            return new Promise(function(resolve, reject) {
                createKey(resolve, reject);
            });
        }
    };
})();
