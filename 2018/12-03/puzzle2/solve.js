#!/usr/bin/env node

const reader = require('../../../lib/reader');
const lineReader = reader.read();

class Claim {
  static get re() {
    return /#(\d+) @ (\d+),(\d+): (\d+)x(\d+)/g;
  }

  constructor(line) {
    const [, id, x, y, w, h] = Claim.re.exec(line);

    this.id = id;
    this.x = parseInt(x);
    this.y = parseInt(y);
    this.w = parseInt(w);
    this.h = parseInt(h);
  }

  get left() {
    return this.x;
  }

  get right() {
    return this.x + this.w;
  }

  get top() {
    return this.y;
  }

  get bottom() {
    return this.y + this.h;
  }
}

const claims = [];
const allOverlaps = [];

const isOverlap = (claimA, claimB) => {
  const aFurtherLeftThanB = claimA.right < claimB.left;
  const aFurtherRightThanB = claimA.left > claimB.right;
  const aFurtherUpThanB = claimA.bottom < claimB.top;
  const aFurtherDownThanB = claimA.top > claimB.bottom;

  return !(
    aFurtherLeftThanB ||
    aFurtherRightThanB ||
    aFurtherUpThanB ||
    aFurtherDownThanB
  );
};

lineReader.on('line', line => {
  const newClaim = new Claim(line);
  const overlapped = claims.filter(claim => isOverlap(newClaim, claim));

  claims.push(newClaim);

  if (overlapped.length) {
    allOverlaps.push(newClaim, ...overlapped);
  }
});

lineReader.on('close', () => {
  while (claims.length) {
    const claim = claims.shift();
    const { id } = claim;

    if (allOverlaps.includes(claim)) {
      continue;
    }

    console.log(`Claim ${id} does not overlap with others.`);
  }
});
