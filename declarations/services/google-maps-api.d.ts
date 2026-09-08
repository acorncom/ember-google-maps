import type Service from '@ember/service';

import type { AsyncProxy } from '../utils/async-data.d.ts';

// Hand-written to type the promise-proxy getters that the auto-generated
// declaration leaves as `any` (the service is authored in JS). Keep in sync
// with services/google-maps-api.js.
export default class GoogleMapsApiService extends Service {
  // The loaded Google Maps API. A promise-proxy (utils/async-data.ts getAsync):
  // `await` it for the namespace, or read the resolved namespace's members off
  // it directly (undefined until it resolves -- guard with `if (this.google.maps)`).
  get google(): AsyncProxy<typeof google>;

  // Lazily constructed once the API loads. Same promise-proxy shape.
  get directionsService(): AsyncProxy<google.maps.DirectionsService>;

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
  buildGoogleMapsUrl(config: object): string | Promise<string>;

  /**
   * Get the configuration for ember-google-maps set in environment.js. This
   * should contain your API key and any other options you set.
   */
  _getConfig(): unknown;

  /**
   * Return or load the Google Maps API.
   */
  _getApi(): Promise<typeof google>;

  _loadAndInitApi(src: string): Promise<typeof google>;
}
