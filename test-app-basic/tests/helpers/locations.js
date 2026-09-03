// Copied from legacy/tests/helpers/locations.js (v1 test suite).
const london = { lat: '51.507568', lng: '-0.127762' };

function setupLocations(hooks) {
  hooks.beforeEach(function () {
    this.lat = london.lat;
    this.lng = london.lng;
  });
}

export { setupLocations, london };
