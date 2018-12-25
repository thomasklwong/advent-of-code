#!/bin/sh

':' //; exec "$(command -v nodejs || command -v node)" "$0" "$@"

const reader = require('../../../lib/reader');
const lineReader = reader.read();

const exact = {
  two: 0,
  three: 0
};


const appearTwiceOrThrice = (str = '') => {
  const normalised = str.split('').sort().join('');
  const re = /(\w)\1\1|(\w)\2/g;
  let result;

  const found = {
    two: false,
    three: false
  }

  console.log(`Normalised ${str} -> ${normalised}`);

  while ((result = re.exec(normalised)) !== null) {
    const [matched, twice, thrice] = result;
    console.log(`Found: ${matched}`);

    if (twice) {
      found.two = true;
    } else if (thrice) {
      found.three = true;
    }

    // Can return early if found both already.
    if (found.two && found.three) {
      return found;
    }
  }

  return found;
};


lineReader.on('line', line => {
  const {
    two,
    three
  } = appearTwiceOrThrice(line);

  if (two) {
    exact.two += 1;
  }
  if (three) {
    exact.three += 1;
  }
});

lineReader.on('close', () => {

  console.log(`checksum: ${exact.two * exact.three}`);
});
