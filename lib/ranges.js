const range = require('./range');

const az = range('a'.charCodeAt(0), 'z'.charCodeAt(0) + 1).map(i =>
  String.fromCharCode(i)
);

module.exports = {
  az
};
