#!/bin/sh

':'; //; exec "$(command -v nodejs || command -v node)" "$0" "$@"

const reader = require('../../../lib/reader');
const lineReader = reader.read();

const ids = [];

const mergeAndDiff = (a = '', b = '') => {
  return a.split('').reduce(
    (acc, char, index) => {
      if (char === b[index]) {
        acc.common += char;
      } else {
        acc.diff.push(char);
      }

      return acc;
    },
    {
      common: '',
      diff: []
    }
  );
};

lineReader.on('line', line => ids.push(line));

lineReader.on('close', () => {
  let found = false;
  let result = {};

  ids.sort();

  console.log(ids.length);

  while (!found && ids.length) {
    const first = ids.shift();

    ids.some(id => {
      result = mergeAndDiff(id, first);
      found = result.diff.length === 1;

      console.log(
        `(${first}, ${id}), common: ${result.common}, diff: ${result.diff}`
      );

      return found;
    });
  }

  console.log(`The common are: ${result.common}`);
});
