import { setOwner } from '@ember/application';
import { setComponentManager } from '@ember/component';
import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { DEBUG } from '@glimmer/env';

import { MapComponentManager } from '../../component-managers/map-component-manager.js';
import { addEventListeners } from '../../utils/options-and-events.js';
import { readContext } from '../../context.js';

export function combine(base, extra) {
  return Object.defineProperties(base, Object.getOwnPropertyDescriptors(extra));
}

export function MapComponentAPI(source) {
  let name = source.name ?? 'unknown';

  return {
    get map() {
      return source.map;
    },

    get [name]() {
      return source.mapComponent;
    },

    get mapComponent() {
      return source.mapComponent;
    },
  };
}

export default class MapComponent {
  @tracked mapComponent;

  boundEvents = [];

  get publicAPI() {
    return MapComponentAPI(this);
  }

  get map() {
    return this.mapContext?.map;
  }

  // Ambient context provided by the nearest <GMap> (v2 facade, replacing the v1
  // curried `this.args.getContext`). Reads the whole provided publicAPI object.
  get mapContext() {
    let ctx = readContext(this);

    // Caveat C1: under a strict resolver the polyfill's VM override may not be
    // active, so context reads `undefined` *silently*. Fail loudly in dev.
    if (DEBUG && ctx === undefined) {
      assert(
        `<${this.constructor.name}> must be rendered inside <GMap>. ` +
          `If your app uses the strict resolver, add \`import 'ember-google-maps/setup';\` to your app.js.`,
        false,
      );
    }

    return ctx;
  }

  constructor(owner, args, options, events) {
    setOwner(this, owner);

    this.args = args;
    this.options = options;
    this.events = events;

    this.register();
  }

  setup() {}

  teardown(mapComponent) {
    this.boundEvents.forEach(({ remove }) => remove());

    // Cleanup events by removing map.
    if (mapComponent) {
      mapComponent.setMap?.(null);
    }

    // Unregister from the parent component
    this.onTeardown?.();
  }

  register() {
    // Register with the parent map via the ambient context's `getComponent`
    // (replaces the v1 `this.args.getContext` curried arg).
    let ctx = this.mapContext;

    if (ctx && typeof ctx.getComponent === 'function') {
      let { remove } = ctx.getComponent(this.publicAPI, this.name);
      this.onTeardown = remove;
    }
  }

  /* Events */

  addEventsToMapComponent(mapComponent, events = {}, payload = {}) {
    assert('You need to pass in a map component', mapComponent);

    let boundEvents = addEventListeners(mapComponent, events, payload);

    this.boundEvents.concat(boundEvents);
  }
}

setComponentManager((owner) => new MapComponentManager(owner), MapComponent);
