// ESLint 9 flat config format.
// Note: the system design doc names this file `.eslintrc.js`, but ESLint 9
// (the version resolved by npm at the time this project was scaffolded)
// uses flat config (`eslint.config.js`) by default — see the summary notes
// below this file for details on why this was changed.
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier');
const prettierPlugin = require('eslint-plugin-prettier');

module.exports = [
  ...expoConfig,
  prettierConfig,
  {
    plugins: {
      prettier: prettierPlugin,
    },
    rules: {
      'prettier/prettier': 'warn',
    },
  },
  {
    ignores: ['node_modules/**', 'dist/**', '.expo/**', 'functions/lib/**'],
  },
];
