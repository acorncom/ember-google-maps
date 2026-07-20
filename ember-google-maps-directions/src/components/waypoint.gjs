import { MapComponent } from 'ember-google-maps';

function WaypointAPI(source) {
  let { options } = source;

  return {
    get location() {
      return options.location;
    },

    get stopover() {
      return options.stopover;
    },
  };
}

// A waypoint for the parent <Directions>. It registers with the directions
// component (not the map) via the yielded `register` callback — the v2
// replacement for v1's curried `getContext`:
//   <Directions ... as |d|>
//     <Waypoint @register={{d.registerWaypoint}} @location="..." @stopover={{true}} />
//   </Directions>
export default class Waypoint extends MapComponent {
  get name() {
    return 'waypoints';
  }

  get publicAPI() {
    return WaypointAPI(this);
  }

  // Register with the parent Directions instead of the map. Overrides the base
  // register() (which would register with the nearest <GMap>).
  register() {
    this.onTeardown = this.args.register?.(this.publicAPI);
  }

  setup() {
    return this.publicAPI;
  }

  teardown() {
    this.onTeardown?.();
  }

  <template></template>
}
