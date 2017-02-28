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

function validate(step, printableFunc, result, expected){
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
      assert(valid, `function: ${printableFunc}, case: ${printableCase}, got: ${printableResult}`);
    }
    return valid;
  }

  deepValidation(result, expected);
}

function iotest(cases, procedure){

  let scenario = null;
  let step = null;
  let printableCase = "";
  let printableFunc =  /^function\s+([\w\$]+)\s*\(/.exec( procedure.toString() )
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
      assert(false, `func: ${printableFunc}, case: ${printableCase}, unsupported test case`);
    }
  }catch(err){
    assert(false, `func: ${printableFunc}, case: ${printableCase}, ${err.message}`);
  }

  function returnStatement(){
    let input = toArray(step.in);
    let result = procedure.apply({}, input);
    validate(step, printableFunc, result, step.return);
    resume();
  }

  function promise(){
    let input = toArray(step.in);
    procedure.apply({}, input).
    then(function(result){
      if(step.then){
        assert(true, `func: ${printableFunc}, case: ${printableCase}, expected resolve`);
        validate(step, printableFunc, result, step.then);
      }else{
        assert(false, `func: ${printableFunc}, case: ${printableCase}, unexpected resolve`);
      }
      resume();
    }).
    catch(function(err){
      if(step.catch){
        assert(true, `func: ${printableFunc}, case: ${printableCase},  expected reject`);
        validate(step, printableFunc, err, step.catch);
      }else{
        assert(false, `func: ${printableFunc}, case: ${printableCase},  unexpected reject`);
      }
      resume();
    });
  }

  function error(){
    let input = toArray(step.in);
    try{
      procedure.apply({}, input);
      assert(false, `func: ${printableFunc}, case: ${printableCase},  unexpected success`);
    }catch(err){
      assert(true, `func: ${printableFunc}, case: ${printableCase},  expected error`);
      validate(step, printableFunc, err, step.error);
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
