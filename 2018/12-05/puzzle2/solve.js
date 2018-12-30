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
  constructor(line, released) {
    this.id = released.toUpperCase();
    this.done = false;
    this.units = line.replace(new RegExp(this.id, 'gi'), '');
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
    return `[-${this.id}] Length: ${this.units.length}`;
  }
}

let polymers;
lineReader.on('line', line => {
  polymers = az.map(char => new Polymer(line, char));
});

lineReader.on('close', () => {
  while (polymers.some(polymer => !polymer.done)) {
    polymers.forEach(polymer => {
      polymer.react();
      console.log(`Intermediate: ${polymer}`);
    });
    console.log('\n');
  }

  polymers.forEach(polymer => console.log(`${polymer}`));
});
