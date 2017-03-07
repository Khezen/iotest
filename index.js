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

function validate(step, expected, result){
  const printableCase = JSON.stringify(step);
  const printableResult = result instanceof Object?JSON.stringify(result): result;
  function deepValidation(exp, got){
    let valid = false;
    if(exp instanceof Object){
      for (let prop in exp){
        if (exp.hasOwnProperty(prop)){
          valid = deepValidation(exp[prop], got[prop]);
        }
      }
    }else if(exp instanceof Array){
      for(let i = 0; i < exp.length; i++){
        valid = deepValidation(exp[i], got[i]);
      }
    }else{
      valid = got === exp;
      assert(valid, `case: ${printableCase}, got: ${printableResult}`);
    }
    return valid;
  }

  deepValidation(expected, result);
}

function iotest(cases, procedure){

  let results = [];
  let scenario = null;
  let step = null;
  let printableCase = null;

  function returnStatement(resolve, reject){
    let inputs = toArray(step.inputs);
    let result = procedure.apply({}, inputs);
    results.push(result);
    validate(step, step.return, result);
    resume(resolve, reject);
  }

  function promise(resolve, reject){
    let inputs = toArray(step.inputs);
    procedure.apply({}, inputs).
    then(function(result){
      results.push(result);
      if(step.resolve){
        assert(true, `case: ${printableCase}, expected resolve`);
        validate(step, step.resolve, result);
      }else{
        assert(false, `case: ${printableCase}, unexpected resolve`);
      }
      resume(resolve, reject);
    }).
    catch(function(err){
      results.push(err);
      if(step.reject){
        assert(true, `case: ${printableCase},  expected reject`);
        validate(step, step.reject, err);
      }else{
        assert(false, `case: ${printableCase},  unexpected reject`);
      }
      resume(resolve, reject);
    });
  }

  function error(resolve, reject){
    let inputs = toArray(step.inputs);
    try{
      let result = procedure.apply({}, inputs);
      results.push(result);
      assert(false, `case: ${printableCase},  unexpected success`);
    }catch(err){
      results.push(err);
      assert(true, `case: ${printableCase},  expected error`);
      validate(step, step.throw, err);
    }finally{
      resume(resolve, reject);
    }
  }

  function resume(resolve, reject){
    if(cases.length){
      iotest(cases, procedure).
      then( (moreResults) => {
        results = results.concat(moreResults);
        resolve(results);
      }).
      catch( (err) => {
        reject(err);
      });
    }else{
      resolve(results);
    }
  }

  return new Promise((resolve, reject) => {
    try{
      scenario = toArray(cases);
      step = scenario.shift();
      printableCase = JSON.stringify(step).replace("\\", "");
      if(step.return){
        returnStatement(resolve, reject);
      }else if(step.resolve || step.reject){
        promise(resolve, reject);
      }else if(step.throw){
        error(resolve, reject);
      }else{
        assert(false, `case: ${printableCase}, unsupported test case`);
      }
    }catch(err){
      reject(err);
    }
  });
}
module.exports = iotest;
