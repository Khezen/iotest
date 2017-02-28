"use strict";
const iotest = require("./index");

function f(x){
  return x+1;
}

const cases = [{
    in: 3,
    return: 4
  },{
    in: null,
    error: {}
  }
];

iotest(cases, f);
