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
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/ban-types': ['error', { types: { object: false, extendDefaults: true } }],
    'import/no-unresolved': 'error',
    'import/no-duplicates': 'error',
    'import/no-relative-packages': 'error',
    'import/no-commonjs': 'error',
    'import/exports-last': 'warn',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/order': 'error',
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: ['../*'],
            message: 'No relative parent imports, use full path'
          }
        ]
      }
    ]
  },
  files: ['src/**/*.ts', 'src/**/*.js']
});
