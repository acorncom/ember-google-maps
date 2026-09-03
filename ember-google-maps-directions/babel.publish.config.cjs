/**
 * This babel.config is only used for publishing.
 *
 * For local dev experience, see the babel.config
 */
module.exports = {
  plugins: [
    // ember-concurrency v5 only supports the `task(async () => {})` form, which
    // this transform compiles into the task machinery. Required for the addon
    // build (a v1 addon relied on the consuming app's build running this — a v2
    // addon must run it itself).
    'ember-concurrency/async-arrow-task-transform',
    [
      'babel-plugin-ember-template-compilation',
      {
        targetFormat: 'hbs',
        transforms: [],
      },
    ],
    [
      'module:decorator-transforms',
      {
        runtime: {
          import: 'decorator-transforms/runtime-esm',
        },
      },
    ],
  ],

  generatorOpts: {
    compact: false,
  },
};
