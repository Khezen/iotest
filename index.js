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


function iotest(scenario, procedure){

  let cases = toArray(scenario);
  try{
    let testCase = cases.shift();
    if(testCase.return){
      returnStatement(testCase, procedure);
    }else if(testCase.then || testCase.catch){
      promise(testCase, procedure);
    }else if(testCase.error){
      error(testCase, procedure);
    }else{
      assert(false, "unsupported test case");
    }
  }catch(err){
    assert(false, err.message);
  }

  function returnStatement(testCase, procedure){
    let input = toArray(testCase.in);
    let result = procedure.apply({}, input);
    validate(result, testCase.return);
    resume();
  }

  function promise(testCase, procedure){
    let input = toArray(testCase.in);
    procedure.apply({}, input).
    then(function(result){
      if(testCase.then){
        assert(true, "expected resolve");
        validate(result, testCase.then);
      }else{
        assert(false, "unexpected resolve");
      }
      resume();
    }).
    catch(function(err){
      if(testCase.catch){
        assert(true, "expected reject");
        validate(err, testCase.catch);
      }else{
        assert(false, "unexpected reject");
      }
      resume();
    });
  }

  function error(testCase, procedure){
    let input = toArray(testCase.in);
    try{
      procedure.apply({}, input);
      assert(false, "unexpected success");
    }catch(err){
      assert(true, "expected error");
      validate(err, testCase.error);
    }finally{
      resume();
    }
  }

  function resume(){
    if(cases.length){
      iotest(cases, procedure);
    }
  }

}

module.exports = iotest;
