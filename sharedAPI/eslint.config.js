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
  plugins: {
    import: require('eslint-plugin-import')
  },
  settings: {
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true
      }
    }
  },
  rules: {
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-types': ['error', { types: { object: false, extendDefaults: true } }],
    'import/no-unresolved': 'error',
    'import/no-duplicates': 'error',
    'import/no-relative-packages': 'error',
    'import/no-commonjs': 'error',
    'import/exports-last': 'error',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/order': 'error',
    'no-restricted-imports': [
      'off',
      {
        patterns: [
          {
            group: ['../*'],
            message: 'No relative imports'
          }
        ]
      }
    ]
  },
  files: ['src/**/*.ts', 'src/**/*.js']
});
