const orTools = require('node_or_tools');
//TODO:Export api key as docker secret
const DISTANCE_MATRIX_KEY = 'AIzaSyDwlirBm11mXCa1XMybii6dPLWpIwblmsE';
const client = require('@google/maps')
    .createClient({
        key: DISTANCE_MATRIX_KEY,
        Promise: Promise
    });


// client.distanceMatrix({
//         origins: [{
//             lat: 22.275820,
//             lng: 114.155968
//         }],
//         destinations: [{
//             lat: 22.271829,
//             lng: 114.163070
//         }, {
//             lat: 22.267377,
//             lng: 114.151866
//         }, {
//             lat: 22.265556,
//             lng: 114.163442
//         }]
//     })
//     .asPromise()
//     .then((result) => {
//         console.log("Success: ", JSON.stringify(result.json));
//     }, (err) => {
//         console.log("Error: ", err);
//     });
