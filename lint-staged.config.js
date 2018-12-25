module.exports = {
  'lint-staged': {
    '*.{js,json,css,md}': ['prettier --write', 'git add']
  }
};
