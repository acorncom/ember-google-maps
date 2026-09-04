// Shared by the `markers`, `advanced-markers`, and `overlays` docs pages. Ported from v1's
// `app/services/map-data.js#createLocations` — the original read `this.google`
// off an injected service; this version takes `google` as a plain argument so
// it has no service dependency at all (services don't work in live fences here,
// see the `getOwner` pattern used by the pages that call this).
function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function createLocations(google, origin, numLocations = 42) {
  return Array(numLocations)
    .fill()
    .map((_e, i) => {
      let heading = randomInt(1, 360),
        distance = randomInt(100, 5000),
        price = randomInt(0, 2000),
        n = google.maps.geometry.spherical.computeOffset(origin, distance, heading),
        type = randomInt(1, 5);

      return { id: i, lat: n.lat(), lng: n.lng(), price, type, active: false };
    });
}
