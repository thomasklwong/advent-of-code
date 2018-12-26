#!/usr/bin/env node

const fs = require('fs');
const readline = require('readline');

const lineReader = readline.createInterface({
  input: fs.createReadStream('input.txt'),
  crlfDelay: Infinity
});

let frequency = 0;
const filter = /([+-])(\d+)/;
lineReader.on('line', line => {
  const result = filter.exec(line);

  if (result === null) {
    console.error(`Cannot find info in line "${line}".`);
    return;
  }

  const [_, sign, f] = result;

  if (sign === '+') {
    frequency += parseInt(f);
  } else if (sign === '-') {
    frequency -= parseInt(f);
  } else {
    console.error(`Unknown operation in line "${line}".`);
  }

  console.log(`Frequency now: ${frequency}`);
});

console.warn(`Frequency: ${frequency}`);
