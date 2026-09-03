import { defineConfig } from 'vite';
import { extensions, classicEmberSupport, ember } from '@embroider/vite';
import { babel } from '@rollup/plugin-babel';

export default defineConfig({
  plugins: [
    classicEmberSupport(),
    ember(),
    babel({
      babelHelpers: 'runtime',
      extensions,
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        // _bootstrap-custom.scss imports Bootstrap's own partials by bare
        // name (`@import "functions"`, etc.) rather than a full package
        // path -- this makes those imports resolve against Bootstrap's
        // scss directory, matching how v1's ember-cli-sass was configured.
        loadPaths: ['node_modules/bootstrap/scss'],
        // Bootstrap 4's own vendored SCSS triggers these under modern Dart
        // Sass -- nothing here is our code to fix, just noise from a
        // framework version that predates these deprecations.
        silenceDeprecations: [
          'import',
          'color-functions',
          'global-builtin',
          'if-function',
          'abs-percent',
        ],
      },
    },
  },
});
