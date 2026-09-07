// Type-only consumer probe for the google-maps-api service, resolved from the
// packed public API (same discipline as public-api.probe.ts). The service's
// `.google`/`.directionsService` are promise-proxies (utils/async-data.ts
// getAsync): awaitable AND you can read the resolved value's members directly.
import type GoogleMapsApiService from 'ember-google-maps/services/google-maps-api';
import type { AsyncProxy } from 'ember-google-maps';

declare const api: GoogleMapsApiService;

// awaitable to the loaded google namespace
async function useAwait() {
  const g = await api.google;
  return new g.maps.LatLng(1, 2);
}

// ...and the resolved namespace's members read directly (undefined until loaded)
const maps: typeof google.maps | undefined = api.google.maps;

// directionsService resolves to a real DirectionsService
async function useDirections() {
  const service = await api.directionsService;
  return service.route;
}

// AsyncProxy is exported and generic
type Proxy = AsyncProxy<typeof google>;
const proxy: Proxy = api.google;

// `.google` is no longer `any` -- a member that was never on it is now caught.
// @ts-expect-error definitelyNotAThing is not on the google namespace
const bogus: unknown = api.google.definitelyNotAThing;

console.log(useAwait, maps, useDirections, proxy, bogus);
