"use strict";

const chai = require("chai");
const assert = chai.assert;

function toArray(input){
  if( input instanceof Array){
    return input;
  }else{
    return [input];
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

function iotest(cases, procedure){

  let scenario = null;
  try{
    scenario = toArray(scenario);
    let step = cases.shift();
    if(step.return){
      returnStatement(step, procedure);
    }else if(step.then || step.catch){
      promise(step, procedure);
    }else if(step.error){
      error(step, procedure);
    }else{
      assert(false, "unsupported test case");
    }
  }catch(err){
    assert(false, err.message);
  }

  function returnStatement(step, procedure){
    let input = toArray(step.in);
    let result = procedure.apply({}, input);
    validate(result, step.return);
    resume();
  }

  function promise(step, procedure){
    let input = toArray(step.in);
    procedure.apply({}, input).
    then(function(result){
      if(step.then){
        assert(true, "expected resolve");
        validate(result, step.then);
      }else{
        assert(false, "unexpected resolve");
      }
      resume();
    }).
    catch(function(err){
      if(step.catch){
        assert(true, "expected reject");
        validate(err, step.catch);
      }else{
        assert(false, "unexpected reject");
      }
      resume();
    });
  }

  function error(step, procedure){
    let input = toArray(step.in);
    try{
      procedure.apply({}, input);
      assert(false, "unexpected success");
    }catch(err){
      assert(true, "expected error");
      validate(err, step.error);
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
