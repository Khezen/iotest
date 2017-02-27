"use strict";

const chai = require("chai");
const assert = chai.assert;
const toArray = require("./formatInput");

module.exports = function(testCase, procedure){
  const input = toArray(testCase.in);
  let result = procedure.apply(null, input);
  for (let prop in testCase.return){
    if (testCase.return.hasOwnProperty(prop)){
      assert(result[prop] === testCase.return[prop], `unexpected ${prop}`);
    }
  }
};
