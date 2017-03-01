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

  let results = [];
  let scenario = null;
  let step = null;
  let printableCase = null;

  function returnStatement(resolve){
    let inputs = toArray(step.inputs);
    let result = procedure.apply({}, inputs);
    results.push(result);
    validate(step, result, step.return);
    resume(resolve);
  }

  function promise(resolve){
    let inputs = toArray(step.inputs);
    procedure.apply({}, inputs).
    then(function(result){
      results.push(result);
      if(step.resolve){
        assert(true, `case: ${printableCase}, expected resolve`);
        validate(step, result, step.resolve);
      }else{
        assert(false, `case: ${printableCase}, unexpected resolve`);
      }
      resume(resolve);
    }).
    catch(function(err){
      results.push(err);
      if(step.reject){
        assert(true, `case: ${printableCase},  expected reject`);
        validate(step, err, step.reject);
      }else{
        assert(false, `case: ${printableCase},  unexpected reject`);
      }
      resume(resolve);
    });
  }

  function error(resolve){
    let inputs = toArray(step.inputs);
    try{
      let result = procedure.apply({}, inputs);
      results.push(result);
      assert(false, `case: ${printableCase},  unexpected success`);
    }catch(err){
      results.push(err);
      assert(true, `case: ${printableCase},  expected error`);
      validate(step, err, step.throw);
    }finally{
      resume(resolve);
    }
  }

  function resume(resolve){
    if(cases.length){
      iotest(cases, procedure).
      then((moreResults) => {
        results = results.concat(moreResults);
        resolve(results);
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
        returnStatement(resolve);
      }else if(step.resolve || step.reject){
        promise(resolve);
      }else if(step.throw){
        error(resolve);
      }else{
        assert(false, `case: ${printableCase}, unsupported test case`);
      }
    }catch(err){
      reject(err);
    }
  });
}
module.exports = iotest;
