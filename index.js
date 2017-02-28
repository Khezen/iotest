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
  let printableCase = JSON.stringify(step);
  if(step.return){
    returnStatement();
  }else if(step.then || step.catch){
    promise();
  }else if(step.error){
    error();
  }else{
    assert(false, `case: ${printableCase}, unsupported test case`);
  }

  function returnStatement(){
    let input = toArray(step.in);
    let result = procedure.apply({}, input);
    validate(step, result, step.return);
    resume();
  }

  function promise(){
    let input = toArray(step.in);
    procedure.apply({}, input).
    then(function(result){
      if(step.then){
        assert(true, `case: ${printableCase}, expected resolve`);
        validate(step, result, step.then);
      }else{
        assert(false, `case: ${printableCase}, unexpected resolve`);
      }
      resume();
    }).
    catch(function(err){
      if(step.catch){
        assert(true, `case: ${printableCase},  expected reject`);
        validate(step, err, step.catch);
      }else{
        assert(false, `case: ${printableCase},  unexpected reject`);
      }
      resume();
    });
  }

  function error(){
    let input = toArray(step.in);
    try{
      procedure.apply({}, input);
      assert(false, `case: ${printableCase},  unexpected success`);
    }catch(err){
      assert(true, `case: ${printableCase},  expected error`);
      validate(step, err, step.error);
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
