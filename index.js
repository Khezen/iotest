"use strict";
const chai = require("chai");
const assert = chai.assert;

function toArray(input){
  if( !input && input.constructor !== Array){
    return [input];
  }else{
    return input;
  }
}

function validate(result, expected){
  for (let prop in expected){
    if (expected.hasOwnProperty(prop)){
      assert(result[prop] === expected[prop], `unexpected ${prop}`);
    }
  }
}

function returnStatement(testCase, procedure){
  const input = toArray(testCase.in);
  let result = procedure.apply(null, input);
  validate(result, testCase.return);
}

function promise(testCase, procedure){
  const input = toArray(testCase.in);
  procedure.apply(null, input).
  then(function(result){
    if(testCase.then){
      validate(result, testCase.then);
    }
  }).
  catch(function(err){
    if(testCase.catch){
      validate(err, testCase.catch);
    }
  });
}

module.exports = function(scenario, procedure){
  let cases = toArray(scenario);
  let testCase = cases[0];
  if(testCase.return){
    returnStatement(testCase, procedure);
  }else if(testCase.then || testCase.catch){
    promise(testCase, procedure);
  }else{
    assert(false, "unsupported test case");
  }
};
