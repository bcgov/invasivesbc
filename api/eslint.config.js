// module version (future)
//
// import eslint from '@eslint/js';
// import tseslint from 'typescript-eslint';
//
// export default tseslint.config(eslint.configs.recommended, ...tseslint.configs.recommended, {
//   rules: {
//     '@typescript-eslint/no-explicit-any': 'off',
//     '@typescript-eslint/ban-types': ['error', { types: { object: false, extendDefaults: true } }]
//   }
// });

//CJS version
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');

module.exports = tseslint.config(eslint.configs.recommended, ...tseslint.configs.recommended, {
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-types': ['error', { types: { object: false, extendDefaults: true } }]
  },
  files: ['src/**/*.ts', 'src/**/*.js']
});
