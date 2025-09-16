import js from '@eslint/js';
import prettier from 'eslint-plugin-prettier';
import vue from 'eslint-plugin-vue';
import vueParser from 'vue-eslint-parser';
import tseslint from 'typescript-eslint';

const typeAwareOptions = {
  project: ['./tsconfig.json', './tsconfig.app.json', './tsconfig.node.json'],
  tsconfigRootDir: import.meta.dirname,
};

const tsConfigs = tseslint.configs.recommendedTypeChecked.map((config) => ({
  ...config,
  files: ['**/*.ts', '**/*.tsx'],
  languageOptions: {
    parser: tseslint.parser,
    parserOptions: {
      ...config.languageOptions?.parserOptions,
      ...typeAwareOptions,
    },
    globals: {
      window: 'readonly',
      document: 'readonly',
      ResizeObserver: 'readonly',
    },
  },
}));

const vueConfigs = vue.configs['flat/recommended'].map((config) => ({
  ...config,
  files: ['**/*.vue'],
  languageOptions: {
    parser: vueParser,
    parserOptions: {
      ...config.languageOptions?.parserOptions,
      parser: tseslint.parser,
      extraFileExtensions: ['.vue'],
      ...typeAwareOptions,
    },
    globals: {
      window: 'readonly',
      document: 'readonly',
      ResizeObserver: 'readonly',
    },
  },
}));

export default [
  {
    ignores: ['dist', 'coverage', 'node_modules'],
  },
  js.configs.recommended,
  ...tsConfigs,
  ...vueConfigs,
  {
    files: ['**/*.{ts,tsx,vue}'],
    plugins: {
      prettier,
    },
    rules: {
      'prettier/prettier': 'warn',
      'vue/multi-word-component-names': 'off',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      'vue/attributes-order': 'off',
      'vue/html-closing-bracket-newline': 'off',
      'vue/html-indent': 'off',
      'vue/require-default-prop': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
];
