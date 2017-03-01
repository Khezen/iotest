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

function validate(step, result, expected){
  const printableCase = JSON.stringify(step);
  const printableResult = result instanceof Object?JSON.stringify(result): result;
  function deepValidation(got, exp){
    let valid = false;
    if(exp instanceof Object){
      for (let prop in exp){
        if (exp.hasOwnProperty(prop)){
          valid = deepValidation(got[prop], exp[prop]);
        }
      }
    }else if(exp instanceof Array){
      for(let i = 0; i < exp.length; i++){
        valid = deepValidation(got[i], exp[i]);
      }
    }else{
      valid = got === exp;
      assert(valid, `case: ${printableCase}, got: ${printableResult}`);
    }
    return valid;
  }

  deepValidation(result, expected);
}

function iotest(cases, procedure){

  let scenario = toArray(cases);
  let step = scenario.shift();
  let printableCase = JSON.stringify(step).replace("\\", "");
  if(step.return){
    returnStatement();
  }else if(step.resolve || step.reject){
    promise();
  }else if(step.throw){
    error();
  }else{
    assert(false, `case: ${printableCase}, unsupported test case`);
  }

  function returnStatement(){
    let inputs = toArray(step.inputs);
    let result = procedure.apply({}, inputs);
    validate(step, result, step.return);
    resume();
  }

  function promise(){
    let inputs = toArray(step.inputs);
    procedure.apply({}, inputs).
    then(function(result){
      if(step.resolve){
        assert(true, `case: ${printableCase}, expected resolve`);
        validate(step, result, step.resolve);
      }else{
        assert(false, `case: ${printableCase}, unexpected resolve`);
      }
      resume();
    }).
    catch(function(err){
      if(step.reject){
        assert(true, `case: ${printableCase},  expected reject`);
        validate(step, err, step.reject);
      }else{
        assert(false, `case: ${printableCase},  unexpected reject`);
      }
      resume();
    });
  }

  function error(){
    let inputs = toArray(step.inputs);
    try{
      procedure.apply({}, inputs);
      assert(false, `case: ${printableCase},  unexpected success`);
    }catch(err){
      assert(true, `case: ${printableCase},  expected error`);
      validate(step, err, step.throw);
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
