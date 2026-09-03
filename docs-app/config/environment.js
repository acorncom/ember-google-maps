'use strict';

module.exports = function (environment) {
  const ENV = {
    modulePrefix: 'docs-app',
    environment,
    rootURL: '/',
    locationType: 'history',
    EmberENV: {
      EXTEND_PROTOTYPES: false,
      FEATURES: {},
    },

    APP: {},

    // ember-google-maps config. GOOGLE_MAPS_API_KEY here must be a
    // domain-restricted key for the deployed docs site's own domain — NOT
    // the test suite's localhost-only key. See Task 6.
    'ember-google-maps': {
      key: process.env.GOOGLE_MAPS_API_KEY,
      libraries: ['places', 'marker', 'geometry'],
    },
  };

  if (environment === 'production') {
    // here you can enable a production-specific feature
  }

  return ENV;
};
