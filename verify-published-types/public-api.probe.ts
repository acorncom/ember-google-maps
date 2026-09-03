// Type-only smoke test against the addon's PACKED public API -- resolved
// from a real `pnpm pack` tarball (see scripts/verify-published-types.mjs),
// not the pnpm workspace symlink that test-app-basic's Glint fixture goes
// through. The symlink never walks package.json's exports map, so it can't
// catch exports-map bugs (the wildcard "./*" export's types condition) or
// declarations/ build-wiring bugs (push-dist.yml's prepack step) -- only a
// real packed install can.
import type { GMapSignature, MarkerSignature } from 'ember-google-maps';

// GMapSignature/MarkerSignature intersect the whole google.maps.MapOptions/
// MarkerOptions bag rather than listing option names by hand -- confirm a
// couple of real, non-hand-picked options still resolve to real types (not
// `any`, not missing).
type GMapMapId = GMapSignature['Args']['mapId'];
type GMapDisableDefaultUI = GMapSignature['Args']['disableDefaultUI'];
type MarkerDraggable = MarkerSignature['Args']['draggable'];

const mapId: GMapMapId = 'demo-map';
const disableDefaultUI: GMapDisableDefaultUI = true;
const draggable: MarkerDraggable = true;

// A prop that was never real on either type should still fail -- proves
// this file is actually being checked, not silently skipped.
// @ts-expect-error
type Bogus = GMapSignature['Args']['thisPropertyDoesNotExist'];

console.log(mapId, disableDefaultUI, draggable);
