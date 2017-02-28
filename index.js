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

function validate(step, func, result, expected){
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
      assert(valid, `function: ${func.name}, case: ${printableCase}, got: ${printableResult}`);
    }
    return valid;
  }

  deepValidation(result, expected);
}

function iotest(cases, procedure){

  let scenario = null;
  let step = null;
  let printableCase = "";
  try{
    scenario = toArray(cases);
    step = scenario.shift();
    printableCase = JSON.stringify(step);
    if(step.return){
      returnStatement();
    }else if(step.then || step.catch){
      promise();
    }else if(step.error){
      error();
    }else{
      assert(false, `func: ${procedure.name}, case: ${printableCase}, unsupported test case`);
    }
  }catch(err){
    assert(false, `func: ${procedure.name}, case: ${printableCase}, ${err.message}`);
  }

  function returnStatement(){
    let input = toArray(step.in);
    let result = procedure.apply({}, input);
    validate(step, procedure, result, step.return);
    resume();
  }

  function promise(){
    let input = toArray(step.in);
    procedure.apply({}, input).
    then(function(result){
      if(step.then){
        assert(true, `func: ${procedure.name}, case: ${printableCase}, expected resolve`);
        validate(step, procedure, result, step.then);
      }else{
        assert(false, `func: ${procedure.name}, case: ${printableCase}, unexpected resolve`);
      }
      resume();
    }).
    catch(function(err){
      if(step.catch){
        assert(true, `func: ${procedure.name}, case: ${printableCase},  expected reject`);
        validate(step, procedure, err, step.catch);
      }else{
        assert(false, `func: ${procedure.name}, case: ${printableCase},  unexpected reject`);
      }
      resume();
    });
  }

  function error(){
    let input = toArray(step.in);
    try{
      procedure.apply({}, input);
      assert(false, `func: ${procedure.name}, case: ${printableCase},  unexpected success`);
    }catch(err){
      assert(true, `func: ${procedure.name}, case: ${printableCase},  expected error`);
      validate(step, procedure, err, step.error);
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
