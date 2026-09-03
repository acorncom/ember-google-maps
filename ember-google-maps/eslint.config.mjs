/**
 * Debugging:
 *   https://eslint.org/docs/latest/use/configure/debug
 *  ----------------------------------------------------
 *
 *   Print a file's calculated configuration
 *
 *     npx eslint --print-config path/to/file.js
 *
 *   Inspecting the config
 *
 *     npx eslint --inspect-config
 *
 */
import babelParser from '@babel/eslint-parser/experimental-worker';
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import prettier from 'eslint-config-prettier';
import ember from 'eslint-plugin-ember/recommended';
import importPlugin from 'eslint-plugin-import';
import n from 'eslint-plugin-n';
import globals from 'globals';

const esmParserOptions = {
  ecmaFeatures: { modules: true },
  ecmaVersion: 'latest',
};

export default defineConfig([
  globalIgnores(['dist/', 'dist-*/', 'declarations/', 'coverage/', '!**/.*']),
  js.configs.recommended,
  prettier,
  ember.configs.base,
  ember.configs.gjs,
  /**
   * https://eslint.org/docs/latest/use/configure/configuration-files#configuring-linter-options
   */
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },
  {
    files: ['**/*.js'],
    languageOptions: {
      parser: babelParser,
      // Parse-only babel config for .js. Do NOT inherit the project
      // babel.config.cjs — it includes the async babel-plugin-ember-template-
      // compilation, which eslint (sync) can't run and which .js files don't
      // need anyway. Just enable decorator syntax (@tracked/@action/@service).
      parserOptions: {
        requireConfigFile: false,
        babelOptions: {
          // configFile/babelrc false: fully ignore the project babel.config.cjs
          // (its async ember-template-compilation plugin can't run under eslint's
          // sync parse). requireConfigFile:false alone still LOADS a found config.
          configFile: false,
          babelrc: false,
          plugins: [
            ['@babel/plugin-proposal-decorators', { version: 'legacy' }],
          ],
        },
      },
    },
  },
  {
    files: ['**/*.{js,gjs}'],
    languageOptions: {
      parserOptions: esmParserOptions,
      globals: {
        ...globals.browser,
        // The Google Maps JS API global.
        google: 'readonly',
      },
    },
    rules: {
      // This addon deliberately bridges to the runloop (the effect poll,
      // schedule('afterRender'), and next() for event callbacks). That's the
      // core of its reactivity model — see effects/tracking.js.
      'ember/no-runloop': 'off',
    },
  },
  {
    files: ['src/**/*'],
    plugins: {
      import: importPlugin,
    },
    rules: {
      // require relative imports use full extensions
      'import/extensions': ['error', 'always', { ignorePackages: true }],
    },
  },
  /**
   * CJS node files
   */
  {
    files: ['**/*.cjs'],
    plugins: {
      n,
    },

    languageOptions: {
      sourceType: 'script',
      ecmaVersion: 'latest',
      globals: {
        ...globals.node,
      },
    },
  },
  /**
   * ESM node files
   */
  {
    files: ['**/*.mjs'],
    plugins: {
      n,
    },

    languageOptions: {
      sourceType: 'module',
      ecmaVersion: 'latest',
      parserOptions: esmParserOptions,
      globals: {
        ...globals.node,
      },
    },
  },
]);
