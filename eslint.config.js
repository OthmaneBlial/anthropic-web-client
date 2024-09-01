/* eslint-disable no-undef */

const js = require('@eslint/js');
const typescript = require('@typescript-eslint/eslint-plugin');

module.exports = [
  js.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2021,
        sourceType: 'module',
        project: './tsconfig.json',
      },
      globals: {
        // Add browser globals
        window: 'readonly',
        document: 'readonly',
        localStorage: 'readonly',
        console: 'readonly',
        fetch: 'readonly',
        setTimeout: 'readonly',
        // Add Jest globals
        describe: 'readonly',
        it: 'readonly',
        expect: 'readonly',
      }
    },
    plugins: {
      '@typescript-eslint': typescript,
    },
    rules: {
      // Disable no-undef rule as TypeScript's compiler is more accurate
      'no-undef': 'off',
      '@typescript-eslint/no-this-alias': ['error', {
        allowDestructuring: true,
        allowedNames: ['self']
    }],
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/explicit-function-return-type': 'warn',
    },
  },
];