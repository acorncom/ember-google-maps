import { babel } from '@rollup/plugin-babel';
import { Addon } from '@embroider/addon-dev/rollup';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';

const addon = new Addon({
  srcDir: 'src',
  destDir: 'dist',
});

const rootDirectory = dirname(fileURLToPath(import.meta.url));
const babelConfig = resolve(rootDirectory, './babel.publish.config.cjs');

export default {
  // This provides defaults that work well alongside `publicEntrypoints` below.
  // You can augment this if you need to.
  output: addon.output(),

  plugins: [
    // These are the modules that users should be able to import from your
    // addon. Anything not listed here may get optimized away.
    // By default all your JavaScript modules (**/*.js) will be importable.
    // But you are encouraged to tweak this to only cover the modules that make
    // up your addon's public API. Also make sure your package.json#exports
    // is aligned to the config here.
    // See https://github.com/embroider-build/embroider/blob/main/docs/v2-faq.md#how-can-i-define-the-public-exports-of-my-addon
    addon.publicEntrypoints(['**/*.js', '**/*.gjs', 'index.js']),

    // These are the modules that should get reexported into the traditional
    // "app" tree. Things in here should also be in publicEntrypoints above, but
    // not everything in publicEntrypoints necessarily needs to go here.
    addon.appReexports([
      'components/**/*.js',
      'components/**/*.gjs',
      'helpers/**/*.js',
      'helpers/**/*.gjs',
      'modifiers/**/*.js',
      'modifiers/**/*.gjs',
      'services/**/*.js',
      'services/**/*.gjs',
    ]),

    // Follow the V2 Addon rules about dependencies. Your code can import from
    // `dependencies` and `peerDependencies` as well as standard Ember-provided
    // package names.
    addon.dependencies(),

    // This babel config should *not* apply presets or compile away ES modules.
    // It exists only to provide development niceties for you, like automatic
    // template colocation.
    //
    // By default, this will load the actual babel config from the file
    // babel.config.json.
    babel({
      extensions: ['.js', '.gjs'],
      babelHelpers: 'bundled',
      configFile: babelConfig,
    }),

    // Classic name resolution: `<GMap>` in a .hbs template resolves through the
    // app-tree re-export, which appReexports (above) points at the LEAN g-map by
    // default. Repoint just that one re-export at the deprecated bridge so a v1
    // template — `<GMap as |g|><g.marker/>` — keeps working (with deprecations)
    // on a name-resolution/.hbs consumer. The ES `import { GMap }` stays lean
    // (index.js -> components/g-map.gjs); the bridge's all-components coupling is
    // paid only on this classic app-tree path.
    {
      name: 'g-map-classic-reexport-to-bridge',
      generateBundle(_, bundle) {
        let file = bundle['_app_/components/g-map.js'];
        if (file) {
          file.source =
            'export { default } from "ember-google-maps/deprecated/g-map";\n';
        }
      },
    },

    // Ensure that standalone .hbs files are properly integrated as Javascript.
    addon.hbs(),

    // Ensure that .gjs files are properly integrated as Javascript
    addon.gjs(),

    // addons are allowed to contain imports of .css files, which we want rollup
    // to leave alone and keep in the published output.
    addon.keepAssets(['**/*.css']),

    // Remove leftover build artifacts when starting a new build.
    addon.clean(),
  ],
};
