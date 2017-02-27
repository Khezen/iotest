"use strict";

module.exports = function(input){
  if( !input && input.constructor !== Array){
    return [input];
  }else{
    return input;
  }
};
