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

function validate(step, expected, output){
  const printableCase = JSON.stringify(step);
  const printableoutput = output instanceof Object?JSON.stringify(output): output;
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
      assert(valid, `case: ${printableCase}, got: ${printableoutput}`);
    }
    return valid;
  }

  deepValidation(expected, output);
}

function iotest(cases, procedure){

  let outputs = [];
  let scenario = null;
  let step = null;
  let printableCase = null;

  function returnStatement(resolve, reject){
    let inputs = toArray(step.inputs);
    let output = procedure.apply({}, inputs);
    outputs.push(output);
    validate(step, step.return, output);
    resume(resolve, reject);
  }

  function promise(resolve, reject){
    let inputs = toArray(step.inputs);
    procedure.apply({}, inputs).
    then(output => {
      outputs.push(output);
      if(step.resolve){
        assert(true, `case: ${printableCase}, expected resolve`);
        validate(step, step.resolve, output);
      }else{
        assert(false, `case: ${printableCase}, unexpected resolve`);
      }
      resume(resolve, reject);
    }).
    catch( err => {
      outputs.push(err);
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
      let output = procedure.apply({}, inputs);
      outputs.push(output);
      assert(false, `case: ${printableCase},  unexpected success`);
    }catch(err){
      outputs.push(err);
      assert(true, `case: ${printableCase},  expected error`);
      validate(step, step.throw, err);
    }finally{
      resume(resolve, reject);
    }
  }

  function resume(resolve, reject){
    if(cases.length){
      iotest(cases, procedure).
      then( moreoutputs => {
        outputs = outputs.concat(moreoutputs);
        resolve(outputs);
      }).
      catch( err => {
        reject(err);
      });
    }else{
      resolve(outputs);
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
