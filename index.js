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
  let valid = false;
  if(expected instanceof Object){
    for (let prop in expected){
      if (expected.hasOwnProperty(prop)){
        valid = validate(result[prop], expected[prop]);
        assert(valid, `expected: ${expected}, got: ${result}`);
      }
    }
  }else if(expected instanceof Array){
    for(let i = 0; i < expected.length; i++){
      valid = validate(result[i], expected[i]);
      assert(valid, `expected: ${expected}, got: ${result}`);
    }
  }else{
    valid = result === expected;
    assert(valid, `expected: ${expected}, got: ${result}`);
  }
  return valid;
}

function returnStatement(testCase, procedure){
  let input = toArray(testCase.in);
  let result = procedure.apply({}, input);
  validate(result, testCase.return);
}

function promise(testCase, procedure){
  let input = toArray(testCase.in);
  procedure.apply({}, input).
  then(function(result){
    if(testCase.then){
      validate(result, testCase.then);
    }else{
      assert(false, "unexpected resolve");
    }
  }).
  catch(function(err){
    if(testCase.catch){
      validate(err, testCase.catch);
    }else{
      assert(false, "unexpected reject");
    }
  });
}

module.exports = function(scenario, procedure){
  try{
    let cases = toArray(scenario);
    let testCase = cases[0];
    if(testCase.return){
      returnStatement(testCase, procedure);
    }else if(testCase.then || testCase.catch){
      promise(testCase, procedure);
    }else{
      assert(false, "unsupported test case");
    }
  }catch(err){
    assert(false, err.message);
  }

};
