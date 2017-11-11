const Promise = require('bluebird');
const uuid = require('uuid/v4');
const logger = require('winston');

//TODO:Refactor module to be injected with client
//TODO:export redis host, port to environment variable

//TODO:Redesign this module to handle race condition
// in case of multiple instances
module.exports = function(redisClient) {
    /**
     * Create token key after making sure it doesn't exist in redis.
     *@param resolve {function} called when key is created successfull.
     *@param reject {function} called when there is an issue during key creation.
     *
     *NOTE:in case of multiple instances there is a possiblity that
     *      two instances would come up with the same key, hence we need
     *      to check first if key exist or not, then we return the key
     *      only after we persist it.
     */
    function createKey(resolve, reject) {
        let key = uuid();
        logger.info(`Checking key  ${key}  for collision`);
        redisClient.getAsync(key)
            .then(function(value) {
                /**
                 * Key not found
                 */
                if (value == null) {
                    logger.info(`Key  ${key} is available....persisting`);
                    return redisClient.setAsync(key, JSON.stringify({
                        status: "in progress"
                    }));
                } else {
                    //If key is found try again.
                    //TODO:Refactor to prevent stack overflow.
                    logger.warn(`Collision detected for key  ${key}  ..retrying`);
                    createKey(resolve, reject);
                }
            })
            .then(function(result) {
                logger.info(`Key generated successfully : ${key}`);
                resolve(key);
            })
            .catch(function(error) {
                logger.error(`Failed to generate token: ${error}`);
                reject(error);
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
                    .then(function(value) {
                        resolve(JSON.parse(value));
                    })
                    .catch(reject);
            });
        },
        updateToken: function(token, update) {
            return redisClient.setAsync(token, JSON.stringify(update));
        }
    };
};
