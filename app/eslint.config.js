import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import reactPlugin from '@eslint-react/eslint-plugin';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import importPlugin from 'eslint-plugin-import-next';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['src/**/*.ts', 'src/**/*.tsx', 'src/**/*.js'],
    ...reactPlugin.configs['recommended-typescript'],
    plugins: {
      import: importPlugin,
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
      },
      react: {
        version: '19'
      }
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-empty-object-type': 'error',
      '@typescript-eslint/no-unsafe-function-type': 'error',
      '@typescript-eslint/no-wrapper-object-types': 'error',
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          ignoreRestSiblings: true,
          destructuredArrayIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          argsIgnorePattern: '^_' /* prefix a function argument with _ to indicate it is intentionally unused */
        }
      ],
      'import/no-unresolved': 'off',
      'import/no-duplicates': 'error',
      'import/no-relative-packages': 'error',
      'import/no-commonjs': 'error',
      'import/exports-last': 'warn',
      'import/first': 'error',
      'import/newline-after-import': 'error',
      '@typescript-eslint/no-unused-expressions': 'off',
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
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn'
    }
  }
);
