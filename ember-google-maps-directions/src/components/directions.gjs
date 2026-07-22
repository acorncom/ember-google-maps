import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { hash } from '@ember/helper';
import { trackedSet } from '@ember/reactive/collections';
import { task } from 'ember-concurrency';
import { untrack } from '@glimmer/validator';
import { MapComponent } from 'ember-google-maps';

export function DirectionsAPI(source) {
  return {
    get directions() {
      return source.directions;
    },

    get waypoints() {
      return source.waypoints;
    },
  };
}

// Fetches a route from the Google Directions service. Built on ember-google-maps'
// public MapComponent base (so it gets the async lifecycle + map context), and
// keeps ember-concurrency here in the directions package so core never depends
// on it. Yields { directions, registerWaypoint }:
//   <Directions @origin={{o}} @destination={{d}} @travelMode="WALKING" as |dir|>
//     <Route @directions={{dir.directions}} />
//     <Waypoint @register={{dir.registerWaypoint}} @location="..." />
//   </Directions>
export default class Directions extends MapComponent {
  get name() {
    return 'directions';
  }

  get publicAPI() {
    return DirectionsAPI(this);
  }

  @tracked directions = null;

  // Waypoint children registered via the yielded `registerWaypoint`.
  waypointComponents = trackedSet();

  get waypoints() {
    return [
      ...(this.options.waypoints ?? []),
      ...Array.from(this.waypointComponents, ({ location, stopover }) => ({
        location,
        stopover,
      })),
    ];
  }

  setup(options) {
    let newOptions = { ...options, waypoints: this.waypoints };

    // untrack: ember-concurrency tracks the task's own internal state, so
    // without this the setup effect would re-run when that state changes (v1
    // note preserved).
    return untrack(() => this.fetchDirections.perform(newOptions));
  }

  // ember-concurrency v5: the `task(async () => {})` form (keepLatest cancels an
  // in-flight fetch when args change). Compiled by the async-arrow-task-transform
  // wired into this package's babel config.
  fetchDirections = task({ keepLatest: true }, async (options = {}) => {
    let directionsService = new google.maps.DirectionsService();

    let response = await new Promise((resolve, reject) => {
      directionsService.route(options, (result, status) => {
        if (status === 'OK') {
          resolve(result);
        } else {
          reject(status);
        }
      });
    });

    this.directions = response;
    this.events.onDirectionsChanged?.(this.publicAPI);

    return response;
  });

  @action
  registerWaypoint(waypoint) {
    this.waypointComponents.add(waypoint);

    return () => this.waypointComponents.delete(waypoint);
  }

  <template>
    {{yield
      (hash directions=this.directions registerWaypoint=this.registerWaypoint)
    }}
  </template>
}
