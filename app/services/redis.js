const redis = require('redis');
const Promise = require('bluebird');
const uuid = require('uuid/v4');
Promise.promisifyAll(redis.RedisClient.prototype);
Promise.promisifyAll(redis.Multi.prototype);
console.log("connecting!!!");
const redisClient = redis.createClient({
    host: "redis",
    port: 6379
});
redisClient.onAsync('connect')
    .then(function(resolve) {
        console.log("Connected to redis successfully");
    });
/**
 * Create unique token after making sure that key is not created yet
 */
function createKey(resolve, reject) {
    let key = uuid();
    redisClient.getAsync(key)
        .then(function(data) {
            if (data == null) {
                /**
                 * It is safer to persist the key before sending it to the user making sure that
                 * key is 100% taken.
                 */
                redisClient.setAsync(key, JSON.stringify({
                        status: "in progress"
                    }))
                    .then(function(result) {
                        resolve(key);
                    });
                //TODO:Handle error while persisting keys

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
        },
        getToken: function(token) {
            return redisClient.getAsync(token);
        }
    };
})();
