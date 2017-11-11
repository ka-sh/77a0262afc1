const Promise = require('bluebird');
const uuid = require('uuid/v4');
//TODO:Refactor module to be injected with client
//TODO:export redis host, port to environment variable

//TODO:Redesign this module to handle race condition
// in case of multiple instances
module.exports = function(redisClient) {

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

    return {
        /**
         * Generate UUID token.
         */
        generateToken: function() {
            return new Promise(function(resolve, reject) {
                createKey(resolve, reject);
            });
        },
        getToken: function(token) {
            return new Promise(function(resolve, reject) {
                redisClient.getAsync(token)
                    .then(function(result) {
                        resolve(JSON.parse(result));
                    }, function(error) {
                        reject(error);
                    });
            });
        },
        updateToken: function(token, update) {
            return redisClient.setAsync(token, JSON.stringify(update));
        }
    };
};
