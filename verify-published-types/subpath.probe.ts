// Deep imports have real .d.ts files in declarations/, but until the
// wildcard "./*" export got a `types` condition, TypeScript could never
// find them through the package's own exports map -- see
// scripts/verify-published-types.mjs and the "./*" export in
// ember-google-maps/package.json.
import { setupMapTest, waitForMap } from 'ember-google-maps/test-support';
import type GoogleMapsApiService from 'ember-google-maps/services/google-maps-api';

declare const hooks: unknown;
setupMapTest(hooks);
waitForMap('some-id');

declare const svc: GoogleMapsApiService;
console.log(svc.google);
