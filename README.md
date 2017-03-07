# iotest

Javascript library which makes input/output testing a no-brainer.

# install
`npm install --save-dev iotest`

# example with mocha

Test cases are processed sequentially when testing multiple cases:
```
const iotest = require('iotest');

function f(x){
  return x + 1;
}

describe('f', () => {
  it('should pass i/o tests', (done) => {

    const cases = [
      {inputs: 41, return: 42},
      {inputs: 0, return: 1}
    ];

    iotest(cases, f).
    then(outputs => {
      console.log(outputs):
      // => [42, 1]
      done();
    }).
    reject(done);

  });
});
```

Testing one case:
```
const iotest = require('iotest');

function f(x){
  return x + 1;
}

describe('f', () => {
  it('should pass i/o tests', (done) => {

    const case = { inputs: 41, return: 42 };

    iotest(case, f).
    then(outputs => {
      console.log(outputs):
      // => [42]
      done();
    }).
    reject(done);

  });
});
```

# case
JSON object describing a test case.

## `case.inputs`
Given arguments of a function.
### single input
```
const iotest = require('iotest');

function f(x){
  return x + 1;
}

const cases = [
  { inputs: 41, return: 42 },    // succeed
  { inputs: [41], return: 42 },  // succeed
];      

iotest(cases, f).
then{outputs => { /* tests succeed */ } }.
catch{err => { /* tests failed */ } };
```

### multiple inputs
```
const iotest = require('iotest');

function f(x, y){
  return x + y;
}

const case = { inputs: [10, 32], return: 42} // succeed    

iotest(case, f).
then{outputs => { /* tests succeed */ } }.
catch{err => { /* tests failed */ } };
```

## `case.return` - `case.error`
Expected returned output of a function - expected error thrown by a function.
```
const iotest = require('iotest');

function f(x, y){
  if(y === 0){
    throw new Error("division by 0");
  }
  return x / y;  
}

const cases = [
  { inputs: [42, 0], error: {} },   // succeed
  { inputs: [42, 2], return: 21 },  // succeed
];   

iotest(cases, f).
then{outputs => { /* tests succeed */ } }.
catch{err => { /* tests failed */ } };
```

## `case.resolve` - `case.reject`
Expected resolved value - expected rejected error

of the promise returned by a function.
```
const iotest = require('iotest');

function f(x, y){
  return new Promise( (resolve, reject) => {
    if(y === 0){
      reject(new Error("division by 0"));
    }else{
      resolve(x / y);  
    }
  });
}

const cases = [
  { inputs: [42, 0], reject: {} },   // succeed
  { inputs: [42, 2], resolve: 21 },  // succeed
];   

iotest(cases, f).
then{outputs => { /* tests succeed */ } }.
catch{err => { /* tests failed */ } };
```

## depth traversal
if you set `case.return`, `case.error`, `case.resolve` or `case.reject` with an *Object*, then it is deeply traversed to make sure each property exists with the right value in the `output`.
```
const iotest = require('iotest');

function f(x){
  return {
    x: x,
    y: x + 1
  };
}

const cases = [
  { inputs: 41, return: {x: 41} },              // succeed
  { inputs: 0, return: {y: 1} },                // succeed
  { inputs: 1000, return: {x: 1000, y: 1001} }, // succeed
  { inputs: 7, return: {} }                     // succeed
];

iotest(cases, f).
then{outputs => { /* tests succeed */ } }.
catch{err => { /* tests failed */ } };
```

if you set `case.return`, `case.error`, `case.resolve` or `case.reject` with an *Array*, then each item is deeply traversed.
```
const iotest = require('iotest');

function f(x){
  return [
    { x: x, y: x + 1 },
    { x: x, y: y - 1 }
  ];
}

const case = {
  inputs: 41,
  return: [
    {x: 41, y: 42},
    {y: 40}
  ]
}; // succeed


iotest(case, f).
then{outputs => { /* tests succeed */ } }.
catch{err => { /* tests failed */ } };
```
