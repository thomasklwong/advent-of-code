#!/bin/sh

':'; //; exec "$(command -v nodejs || command -v node)" "$0" "$@"

const reader = require('../../../lib/reader');
const lineReader = reader.read();

class Fabric {
  constructor() {
    this.surface = [];
    this.overClaimed = new Set();
  }

  claim(x, y, id) {
    const line = this.surface[x];

    if (!line) {
      this.surface[x] = [];
    }

    const assertion = this.surface[x][y];

    if (!assertion) {
      this.surface[x][y] = [];
    } else {
      const key = `(${x},${y})`;
      if (this.overClaimed.has(key)) {
        console.log(`${key} has already been claimed.`);
      }

      this.overClaimed.add(key);
    }

    this.surface[x][y].push(id);
  }
}

const fabric = new Fabric();

const extractDetails = line => {
  const re = /#(\d+) @ (\d+),(\d+): (\d+)x(\d+)/g;
  const [_, lineNo, xStr, yStr, wStr, hStr] = re.exec(line);
  const x = parseInt(xStr);
  const y = parseInt(yStr);
  const w = parseInt(wStr);
  const h = parseInt(hStr);

  return {
    x,
    y,
    w,
    h,
    lineNo
  };
};

const claim = ({ x, y, w, h, lineNo }) => {
  for (let i = 0; i < w; i++) {
    for (let j = 0; j < h; j++) {
      console.log(`Claiming (${x + i}, ${y + j}) for ${lineNo}`);
      fabric.claim(x + i, y + j, lineNo);
    }
  }
};

lineReader.on('line', line => claim(extractDetails(line)));

lineReader.on('close', () => {
  console.log(`Over-claimed: ${fabric.overClaimed.size}`);
});
