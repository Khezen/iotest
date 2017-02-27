"use strict";
const chai = require("chai");
const assert = chai.assert;
const returnStatement = require("./return");
const promise = require("./promise");

module.exports = function(testCase, procedure){
  if(testCase.return){
    returnStatement(testCase, procedure);
  }else if(testCase.then || testCase.catch){
    promise(testCase, procedure);
  }else{
    assert(false, "unsupported test case");
  }
};
