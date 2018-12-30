#!/usr/bin/env node

const reader = require('@my/lib/reader');
const { az } = require('@my/lib/ranges');

const lineReader = reader.read();

const regexp = new RegExp(
  [
    ...az.map(lower => `${lower}${lower.toUpperCase()}`),
    ...az.map(lower => `${lower.toUpperCase()}${lower}`)
  ].join('|'),
  'g'
);

class Polymer {
  constructor(line) {
    this.done = false;
    this.units = line;
  }

  react() {
    const { done, units } = this;

    if (done) {
      return;
    }

    const newUnit = units.replace(regexp, '');

    if (units === newUnit) {
      this.done = true;
      return;
    }

    this.units = newUnit;
  }

  toString() {
    return `Length: ${this.units.length}`;
  }
}

let polymer;
lineReader.on('line', line => (polymer = new Polymer(line)));

lineReader.on('close', () => {
  while (!polymer.done) {
    polymer.react();
    console.log(`Intermediate: ${polymer}`);
  }

  console.log(`Finish: ${polymer}`);
});
