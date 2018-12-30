#!/usr/bin/env node

const reader = require('../../../lib/reader');
const lineReader = reader.read();

const isLowerCase = s => s === s.toLowerCase();
const isUpperCase = s => s === s.toUpperCase();
const mergeable = (a, b) => {
  if (isUpperCase(a) && isUpperCase(b)) {
    return false;
  }

  if (isLowerCase(a) && isLowerCase(b)) {
    return false;
  }

  return a.toLowerCase() === b.toLowerCase();
};

class Polymer {
  constructor(line) {
    this.units = line;
  }

  react() {
    const { units } = this;
    // Less 1 as we cannot select the last unit
    const max = units.length - 1;
    let found = false;
    let index = 0;

    // Less
    for (; index < max; index++) {
      found = mergeable(units[index], units[index + 1]);

      if (found) {
        break;
      }
    }

    if (found) {
      const left = units.substring(0, index);
      const right = units.substring(index + 2);

      this.units = `${left}${right}`;
    }

    return found;
  }

  toString() {
    return `Length: ${this.units.length}`;
  }
}

let polymer;
lineReader.on('line', line => (polymer = new Polymer(line)));
lineReader.on('close', () => {
  while (polymer.react()) {
    console.log(`Intermediate: ${polymer}`);
  }

  console.log(`Product: ${polymer}`);
});
