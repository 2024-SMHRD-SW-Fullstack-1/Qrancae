import eslintPluginPrettier from 'eslint-plugin-prettier';
import typescriptEslintPlugin from '@typescript-eslint/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  {
    files: ['**/*.{js,ts,jsx,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      sourceType: 'module',
      globals: {
        browser: true,
        node: true,
        es6: true,
      },
      parser: typescriptParser, // TypeScript 파서를 명시적으로 지정
    },
    plugins: {
      prettier: eslintPluginPrettier,
      '@typescript-eslint': typescriptEslintPlugin,
    },
    rules: {
      // ESLint 기본 권장 규칙
      'no-unused-vars': 'warn',
      'no-extra-semi': 'error',
      'no-undef': 'error',
      // TypeScript 관련 규칙
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      // Prettier 관련 규칙
      'prettier/prettier': 'error',
      // 기타 규칙
      'arrow-body-style': 'off',
      'prefer-arrow-callback': 'off',
    },
  },
];
