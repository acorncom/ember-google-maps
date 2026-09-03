// Used by the `directions` docs page. Ported from v1's
// `app/helpers/get-route-steps.js` — the original was an Ember helper
// class; this is the same extraction logic as a plain function, called
// from a getter instead (see the `create-locations.js` pattern used by
// the `markers` page).
export function getRouteSteps(directions) {
  try {
    return directions.routes[0].legs[0].steps;
  } catch (error) {
    return [];
  }
}
