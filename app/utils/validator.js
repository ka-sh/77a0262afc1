const _ = require('underscore');
/**
 *  Validate and parse the input
 *  Return validation object
 * @return {valid:Boolean, err:String, array:Array}
 */
function isValidStringLength(input) {
    if (input == null || typeof(input) == 'undefined') {
        throw new Error('Invalid input');
    }
    if (input.length > 1024) {
        throw new Error('Input length exceeds max');
    }
}

function isMatrix(input) {
    try {
        array = JSON.parse(input)
    } catch (ex) {
        throw new Error('Invalid input string');
    };
    if (!Array.isArray(array)) {
        throw new Error('Not an Array');
    }
    if (_.flatten(array)
        .length == 0) {
        throw new Error('Empty node matrix');
    }
}

function isValidMatrixValues(input) {
    let array = JSON.parse(input);
    /**
     * Invalid coordinate value
     */
    for (let i = 0; i < array.length; i++) {
        try {
            array[i] = [parseFloat(array[i][0]), parseFloat(array[i][1])];
        } catch (ex) {
            throw new Error('invalid coordinate value');
        }
        if (isNaN(array[i][0]) || isNaN(array[i][1])) {
            throw new Error('invalid coordinate value');
        }
    }
    return array;
}


module.exports = {
    isValidInput: function(input) {
        isValidStringLength(input) && isMatrix(input);
        return isValidMatrixValues(input);
    },
    isValidToken: function(token) {
        return new RegExp('^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$')
            .test(token);
    }
}
