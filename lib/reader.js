const fs = require('fs');
const readline = require('readline');

const read = (path = './input.txt') => {
  return readline.createInterface({
    input: fs.createReadStream(path),
    crlfDelay: Infinity
  });
};

module.exports = {
  read
}
