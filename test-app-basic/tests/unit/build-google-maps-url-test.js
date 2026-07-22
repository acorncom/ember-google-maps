import { module, test } from 'qunit';
import { buildGoogleMapsUrl } from 'ember-google-maps/utils/build-google-maps-url';

module('Unit | build-google-maps-url', function () {
  test('returns empty string without key or client', function (assert) {
    assert.strictEqual(buildGoogleMapsUrl({}), '');
  });

  test('builds a url with key and libraries', function (assert) {
    const url = buildGoogleMapsUrl({
      key: 'ABC',
      libraries: ['places', 'marker'],
    });
    assert.true(url.includes('key=ABC'));
    assert.true(url.includes('libraries=places%2Cmarker'));
    assert.true(url.startsWith('//maps.googleapis.com/maps/api/js?'));
  });
});
