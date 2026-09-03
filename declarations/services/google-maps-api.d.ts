export default class GoogleMapsApiService extends Service {
    get google(): any;
    get directionsService(): any;
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
    buildGoogleMapsUrl(config: any): any;
    /**
     * Get the configuration for ember-google-maps set in environment.js. This
     * should contain your API key and any other options you set.
     */
    _getConfig(): any;
    /**
     * Return or load the Google Maps API.
     */
    _getApi(): any;
    _loadAndInitApi(src: any): any;
}
import Service from '@ember/service';
//# sourceMappingURL=google-maps-api.d.ts.map