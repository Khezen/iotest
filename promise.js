"use strict";
const chai = require("chai");
const assert = chai.assert;
const toArray = require("./formatInput");

module.exports = function(testCase, procedure){
  const input = toArray(testCase.in);
  procedure.apply(null, input).
  then(function(result){
    if(testCase.then){
      for (let prop in testCase.then){
        if (testCase.then.hasOwnProperty(prop)){
          assert(result[prop] === testCase.then[prop], `unexpected ${prop}`);
        }
      }
    }
  }).
  catch(function(err){
    if(testCase.catch){
      for (let prop in testCase.catch){
        if (testCase.catch.hasOwnProperty(prop)){
          assert(err[prop] === testCase.catch[prop], `unexpected ${prop}`);
        }
      }
    }
  });
};
