/**
 * Testing validation
 */
const validator = require('../utils/validator');
const assert = require('chai')
    .assert;
const _ = require('underscore');
describe('Testing validators', function() {
    describe('Testing Input Validators', function() {
        it('Should pass on valid destination input', function() {
            let expectedResults = [
                [22.27582, 114.155968],
                [22.271829, 114.16307],
                [22.267377, 114.151866],
                [22.265556, 114.163442]
            ];
            let results = validator.isValidInput('[[22.275820,114.155968],[22.271829,114.163070],[22.267377,114.151866],[22.265556,114.163442]]');
            assert(_.difference(_.flatten(expectedResults), _.flatten(results))
                .length == 0);
        });
        it('should Throw an exception on empty input', function() {
            assert.throws(function() {
                validator.isValidInput()
            }, 'Invalid input');
        });
    });

})
