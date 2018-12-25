#!/bin/sh

':'; //; exec "$(command -v nodejs || command -v node)" "$0" "$@"

const fs = require('fs');
const readline = require('readline');

const lineReader = readline.createInterface({
  input: fs.createReadStream('input.txt'),
  crlfDelay: Infinity
});

const extractor = /([+-])(\d+)/;

const add = (a, b) => a + b;
const subtract = (a, b) => a - b;

const drifts = [];

let currentFrequency = 0;
const log = {};

lineReader.on('line', line => {
  const result = extractor.exec(line);

  if (!result) {
    console.error(`Cannot find info in line "${line}"`);
    return;
  }

  const [fullStringThatMatched, sign, driftString] = result;
  const drift = parseInt(driftString);
  const func = sign === '+' ? add : sign === '-' ? subtract : void 0;

  if (isNaN(drift)) {
    console.error(`The drift value, ${driftString}, is not a number.`);
    return;
  }

  if (!func) {
    console.error(`Cannot recognise the sign, ${sign}, of the drift.`);
    return;
  }

  drifts.push({
    func,
    drift
  });
});

function* cycleDrifts() {
  while (true) {
    for (const data of drifts) {
      yield data;
    }
  }
}

const foundTwice = () => {
  const record = log[currentFrequency];

  if (!record) {
    log[currentFrequency] = 1;
    return false;
  }

  return true;
};

lineReader.on('close', () => {
  const iterator = cycleDrifts();

  while (!foundTwice()) {
    console.log(`Current Frequency: ${currentFrequency}`);
    console.log(`Haven't landed on same frequency twice yet.`);

    const {
      value: { func, drift }
    } = iterator.next();

    currentFrequency = func(currentFrequency, drift);
  }

  console.log(`Landed on frequency: ${currentFrequency} twice.`);
});
