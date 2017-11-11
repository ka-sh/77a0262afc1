const Promise = require('bluebird');
const orTools = require('node_or_tools');
const logger = require('winston');

/**
 * Convert destination array passed by user to
 * Google API desintation object
 *@param {Array[][]} 2D Array contains destinations passed by user
 * @return Array of objects {lat,lan}
 */
function toGoogleDestObj(destinations) {
    logger.info(`Transforming user destination object ${JSON.stringify(destinations)}`);
    const lat = 0;
    const lan = 1;
    let destObj = [];
    for (let i = 0; i < destinations.length; i++) {
        destObj.push({
            lat: destinations[i][lat],
            lng: destinations[i][lan]
        });
    }
    return destObj;
}
/**
 * Check if any of the inserted locations were not-found.
 * in case of not-found location process will fail and will
 * not proceed to get the shortest path.
 @return object Object indicating if any of the coordinate were not found {notfound: Boolean, coordinate: Array }
 */
function checkForUnfound(res) {
    //TODO:implement not found checks
}
/**
 * Build Cost matrix for OR API
 */
function buildCostMatrix(rows) {
    logger.info(`Building cost matrix for ${JSON.stringify(rows)}`);
    let distanceCost = [];
    let timeCost = [];
    for (let i = 0; i < rows.length; i++) {
        let elemArr = rows[i].elements
        let tmpDistanceCost = [];
        let tmpDurationCost = [];
        for (let j = 0; j < elemArr.length; j++) {
            tmpDistanceCost.push(elemArr[j].distance.value);
            tmpDurationCost.push(elemArr[j].duration.value);
        }
        distanceCost.push(tmpDistanceCost);
        timeCost.push(tmpDurationCost);
    }
    return {
        distance: distanceCost,
        time: timeCost
    };
}

/**
 * User google-OR lib to solve shortest path based on the cost matrix provided
 * @param costObj {Array[][]} 2D matrix contianing route cost between all nodes
 */
function findShortestRoute(costObj) {
    logger.info(`Calculating short route for cost matrix: ${JSON.stringify(costObj)}`);
    const tspSolveOpt = {
        numNodes: costObj.distance.length,
        costs: costObj.distance
    };
    return new Promise(function(resolve, reject) {
        new orTools.TSP(tspSolveOpt)
            .Solve({
                computeTimeLimit: (15 * 60 * 1000),
                depotNode: 0
            }, function(err, solution) {
                if (err) {
                    reject(err);
                } else {
                    resolve(solution);
                }
            });
    });
}
/**
 * Calculate shortest route distance, duration based on the route recommended
 * @param route {Array} indicating indices of nodes forming shortest route
 * @param costMatrix {Array[][]} 2D Array contianing costMatrix between all nodes
 * @param coordinate{Array[][]} 2D Array containing original coordinate sent by user
 */
function calculateRouteCost(route, costMatrix, coordinate) {
    let tmpTotalDistance = 0;
    let tmpTotalTime = 0;
    let path = [];
    for (let i = 0; i < route.length; i++) {
        tmpTotalTime += parseFloat(costMatrix.time[route[i]]);
        tmpTotalDistance += parseFloat(costMatrix.distance[route[i]]);
        path.push(coordinate[route[i]]);
    }
    return {
        status: "success",
        total_distance: tmpTotalDistance,
        total_time: tmpTotalTime,
        path: path
    };
}


module.exports = function(redisService, apiCli) {
    /**
     * User google distance matrix API to calculate distances between nodes
     * @param destinations {Array[][]} coordinates provided by user
     *@return Promise {Object} containing distance matrix between coordinates
     */
    function getDistanceBetweenNodes(destinations) {
        let locations = toGoogleDestObj(destinations);
        return apiCli.distanceMatrix({
                origins: locations,
                destinations: locations,
            })
            .asPromise()
    }

    return {
        /**
         * Calculate shortest route and save it to redis
         * @param token {String} key that will be used to update redis entry
         * @param destinations {Array[][]} 2D array containing user coordinates
         */
        getShortestRoute: function(token, destinations) {
            return new Promise(function(resolve, reject) {
                getDistanceBetweenNodes(destinations)
                    .then(function(distanceMatrixApiRes) {
                        let costObj = buildCostMatrix(distanceMatrixApiRes.json.rows);
                        return Promise.all([costObj, findShortestRoute(costObj)]);
                    })
                    .then(function(results) {
                        let cost = calculateRouteCost(results[1], results[0], destinations);
                        return redisService.updateToken(token, cost)
                    })
                    .then(function(updateResult) {
                        logger.info(`Token request ${token} has been processed successfully.`)
                        resolve(updateResult);
                    })
                    .catch(function(err) {
                        logger.error(`Failure during processing request token ${token}: ${err}`)
                        redisClient.updateToken(token, {
                            status: 'failure',
                            error: "reason"
                        });
                        reject(err);
                    });
            });
        }
    }
}
