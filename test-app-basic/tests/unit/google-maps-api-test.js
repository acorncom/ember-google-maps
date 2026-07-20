import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import GoogleMapsApi from 'ember-google-maps/services/google-maps-api';

module('Unit | google-maps-api buildGoogleMapsUrl', function (hooks) {
  setupTest(hooks);

  test('default builds a url from config synchronously', function (assert) {
    let svc = this.owner.lookup('service:google-maps-api');
    let url = svc.buildGoogleMapsUrl({ key: 'K' });
    assert.true(url.includes('key=K'), 'runtime-built url includes the key');
  });

  test('config.src (if present) takes precedence over the runtime builder', function (assert) {
    let svc = this.owner.lookup('service:google-maps-api');
    assert.strictEqual(
      svc.buildGoogleMapsUrl({ src: '//preset.test/js' }),
      '//preset.test/js',
    );
  });

  test('an async override is awaited (v1 async extension point preserved)', async function (assert) {
    class Svc extends GoogleMapsApi {
      async buildGoogleMapsUrl() {
        return '//example.test/js?key=ASYNC';
      }
    }
    this.owner.register('service:gm-async', Svc);
    let svc = this.owner.lookup('service:gm-async');
    let url = await svc.buildGoogleMapsUrl({});
    assert.strictEqual(url, '//example.test/js?key=ASYNC');
  });
});
