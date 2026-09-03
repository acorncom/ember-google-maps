import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

// Ported from legacy/tests/unit/services/google-maps-api-test.js. Exercises the
// real API loader (`_getApi`) and its don't-load-twice behavior against live
// Google. (The pure buildGoogleMapsUrl logic is covered separately in
// tests/unit/google-maps-api-test.js.)
module('Unit | Service | google-maps-api', function (hooks) {
  setupTest(hooks);

  hooks.beforeEach(function () {
    window.google = undefined;

    this.service = this.owner.lookup('service:google-maps-api');
  });

  test('it loads the Google Maps API', async function (assert) {
    await this.service._getApi();
    assert.ok(google.maps);
  });

  test('it skips loading the Google Maps API if it is already loaded', async function (assert) {
    assert.expect(1);

    let multipleAPIsRegex =
      /Google Maps JavaScript API multiple times on this page/;
    let error = console.error;

    try {
      console.error = function (msg) {
        assert.false(
          multipleAPIsRegex.test(msg),
          'The API loader should not load the API multiple times.',
        );

        error.apply(console, arguments);
      };

      await this.service._getApi();
      assert.ok(google.maps);

      // Should skip loading the API again.
      await this.service._getApi();
    } finally {
      console.error = error;
    }
  });
});
