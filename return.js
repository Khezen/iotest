"use strict";

const chai = require("chai");
const assert = chai.assert;
const toArray = require("./formatInput");

module.exports = function(testCase, procedure){
  const input = toArray(testCase.in);
  let result = procedure.apply(null, input);
  for (let prop in testCase.expected){
    if (testCase.expected.hasOwnProperty(prop)){
      assert(result[prop] === testCase.expected[prop], `unexpected ${prop}`);
    }
  }
};
