import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import';

export default tseslint.config(eslint.configs.recommended, ...tseslint.configs.recommended, {
  plugins: {
    import: importPlugin,
    react: reactPlugin,
    'react-hooks': reactHooksPlugin
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
    'import/exports-last': 'warn',
    'import/first': 'error',
    'import/newline-after-import': 'error',
    'import/order': 'error',
    'no-restricted-imports': [
      'warn',
      {
        patterns: [
          {
            group: ['../*'],
            message: 'No relative imports'
          }
        ]
      }
    ],
    'react/display-name': 'error',
    'react/jsx-key': 'error',
    'react/jsx-no-comment-textnodes': 'error',
    'react/jsx-no-duplicate-props': 'error',
    'react/jsx-no-target-blank': 'error',
    'react/jsx-no-undef': 'error',
    'react/jsx-uses-react': 'error',
    'react/jsx-uses-vars': 'error',
    'react/no-children-prop': 'error',
    'react/no-danger-with-children': 'error',
    'react/no-deprecated': 'error',
    'react/no-direct-mutation-state': 'error',
    'react/no-find-dom-node': 'error',
    'react/no-is-mounted': 'error',
    'react/no-render-return-value': 'error',
    'react/no-string-refs': 'error',
    'react/no-unescaped-entities': 'error',
    'react/no-unknown-property': 'error',
    'react/no-unsafe': 'off',
    'react/prop-types': 'error',
    'react/react-in-jsx-scope': 'error',
    'react/require-render-return': 'error',
    'react-hooks/rules-of-hooks': 'error',
    'react-hooks/exhaustive-deps': 'warn'
  },
  files: ['src/**/*.ts', 'src/**/*.js']
});
