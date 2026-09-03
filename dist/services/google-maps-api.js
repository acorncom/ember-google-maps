import Service from '@ember/service';
import { reject, resolve, Promise as Promise$1 } from 'rsvp';
import { getOwner } from '@ember/application';
import { bind } from '@ember/runloop';
import { assert } from '@ember/debug';
import { waitFor } from '@ember/test-waiters';
import { getAsync } from '../utils/async-data.js';
import { buildGoogleMapsUrl } from '../utils/build-google-maps-url.js';
import { n } from 'decorator-transforms/runtime-esm';

class GoogleMapsApiService extends Service {
  get google() {
    return this._getApi();
  }
  static {
    n(this.prototype, "google", [getAsync]);
  }
  get directionsService() {
    return this.google.then(google => new google.maps.DirectionsService());
  }

  /**
   * Build the Google Maps API URL. Override this hook to build it at runtime.
   *
   * You MAY return a Promise that resolves with the URL (e.g. to use external
   * data such as the user's locale when building the URL — for example, fetching
   * the current user's record for localisation). Preserves the v1 async
   * extension point.
   *
   * (v2 delta: the v1 default returned the build-time `config['src']`; there is
   * no build-time URL in v2, so build it at runtime from the environment config.)
   */
  static {
    n(this.prototype, "directionsService", [getAsync]);
  }
  buildGoogleMapsUrl(config) {
    return config?.src ?? buildGoogleMapsUrl(config ?? {});
  }

  /**
   * Get the configuration for ember-google-maps set in environment.js. This
   * should contain your API key and any other options you set.
   */
  _getConfig() {
    return getOwner(this).resolveRegistration('config:environment')['ember-google-maps'];
  }

  /**
   * Return or load the Google Maps API.
   */
  _getApi() {
    if (typeof document === 'undefined') {
      return reject();
    }
    if (window?.google?.maps) {
      return resolve(window.google);
    }
    let config = this._getConfig();
    return resolve(config).then(c => this.buildGoogleMapsUrl(c)) // may return a string OR a promise
    .then(src => this._loadAndInitApi(src));
  }
  static {
    n(this.prototype, "_getApi", [waitFor]);
  }
  _loadAndInitApi(src) {
    assert(`
ember-google-maps: You tried to load the Google Maps API, but the source URL was empty. \
Perhaps you forgot to specify the API key? \
Learn more: https://ember-google-maps.sandydoo.me/docs/getting-started`, src);
    return new Promise$1((resolve, reject) => {
      window.initGoogleMap = bind(() => {
        resolve(window.google);
      });
      let s = document.createElement('script');
      s.type = 'text/javascript';
      s.async = true;
      s.onerror = error => reject(error);
      // Insert into DOM to avoid CORS problems
      document.body.appendChild(s);

      // Load map
      s.src = `${src}&callback=initGoogleMap`;
    });
  }
}

export { GoogleMapsApiService as default };
//# sourceMappingURL=google-maps-api.js.map
