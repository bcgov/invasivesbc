import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(eslint.configs.recommended, ...tseslint.configs.recommended, {
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-types': ['error', { types: { object: false, extendDefaults: true } }]
  }
});

//
// module.exports = [{
//    'extends': [
//     'eslint:recommended',
//     'prettier/@typescript-eslint',
//     'plugin:prettier/recommended',
//     'plugin:@typescript-eslint/eslint-recommended',
//     'plugin:@typescript-eslint/recommended'
//   ],
//   'parser': '@typescript-eslint/parser',
//   'parserOptions': {
//     'ecmaVersion': 2023,
//     'sourceType': 'module'
//   },
//   'ignorePatterns': [
//     'coverage'
//   ],
//   'plugins': ['prettier', '@typescript-eslint'],
//   'env': {
//     'es6': true,
//     'node': true,
//     'mongo': true,
//     'mocha': true,
//     'jest': true,
//     'jasmine': true
//   },
//   'rules': {
//     'prettier/prettier': [
//       'error',
//       {
//         'endOfLine': 'auto'
//       }
//     ],
//     '@typescript-eslint/no-explicit-any': 'off',
//     '@typescript-eslint/explicit-module-boundary-types': 'off',
//     '@typescript-eslint/ban-types': ['error', { 'types': { 'object': false, 'extendDefaults': true } }],
//     'no-var': 'error',
//     'no-console': 'error'
//   }
// }];
