const Promise = require('bluebird');
const orTools = require('node_or_tools');



/**
 * Convert destination array passed by user to
 * Google API desintation object
 * @return Array of objects {lat,lan}
 */
function toGoogleDestObj(destinations) {
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
 * Calculate shortest path
 */
function calculateShortestRoute(costObj) {
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
    return {
        /**
         * Calculate shortest route and save it to redis
         */
        getShortestRoute: function(token, destinations) {
            // console.log("=>>>>Test");
            let locations = toGoogleDestObj(destinations);
            apiCli.distanceMatrix({
                    origins: locations,
                    destinations: locations,
                })
                .asPromise()
                .then(function(results) {
                    //TODO:Check for not found locations
                    //TODO:Build cost matrix
                    let costObj = buildCostMatrix(results.json.rows);
                    console.log(costObj);

                    //TODO:calculate shortest route
                    calculateShortestRoute(costObj)
                        .then(function(result) {
                            console.log(result);
                            let cost = calculateRouteCost(result, costObj, destinations);
                            console.log(cost);
                            redisService.updateToken(token, cost)
                                .then(function(data) {
                                    console.log("success/", data);
                                }, function(err) {
                                    console.error(err);
                                });
                        }, function(err) {
                            console.error(err);
                        });
                    //TODO:Update redis
                }, function(reason) {
                    //TODO:Handle connection or any api-call related errors
                    console.error(reason);
                });
        }
    }
}
