import { setOwner } from '@ember/application';
import { setComponentManager } from '@ember/component';
import { tracked } from '@glimmer/tracking';
import { assert } from '@ember/debug';
import { DEBUG } from '@glimmer/env';
import { MapComponentManager } from '../../component-managers/map-component-manager.js';
import { addEventListeners } from '../../utils/options-and-events.js';
import { readContext } from '../../context.js';
import { g, i } from 'decorator-transforms/runtime-esm';

function combine(base, extra) {
  return Object.defineProperties(base, Object.getOwnPropertyDescriptors(extra));
}
function MapComponentAPI(source) {
  const name = source.name ?? 'unknown';
  return {
    get map() {
      return source.map;
    },
    get [name]() {
      return source.mapComponent;
    },
    get mapComponent() {
      return source.mapComponent;
    }
  };
}

// `OptionsAndEvents` (utils/options-and-events.js) sorts every named arg by
// naming convention alone: anything starting with `on`/`onceOn` is an event
// handler routed to `this.events`, everything else is a google.maps option
// routed to `this.options`. `this.args` keeps the full raw hash either way,
// and so does the template's Args signature — so any component's Args type
// needs to accept arbitrary `on*` props, not just the options it explicitly
// lists. Intersect this into a component's Args, e.g.
// `Args: { lat?: number } & MapComponentEventArgs`.

// The class here merges with the `interface MapComponent` declared at the
// bottom of this file, which is how Glint learns this class is invokable as
// a template component (the same mechanism Glint uses internally for
// `@glimmer/component`). Intentional, not an accidental name collision.
//
// Extension-author note: `S` needs the full `{ Args, Blocks, Element }`
// shape (like MapComponentSignature above) to get real Element typing on
// your subclass -- `ComponentSignatureElement<S>` falls back to `unknown`
// for a flat `S = MyArgs` type param, which is what every worked example in
// this file uses. A flat Args type still gets real Args/event-arg checking;
// it just won't type `class=`/modifiers on your component's root element.
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
class MapComponent {
  static {
    g(this.prototype, "mapComponent", [tracked]);
  }
  #mapComponent = (i(this, "mapComponent"), void 0);
  boundEvents = [];
  options;
  events;
  onTeardown;
  get publicAPI() {
    return MapComponentAPI(this);
  }

  // Ambient context always comes from the nearest <GMap>, whose publicAPI
  // delegates `map` straight to its own `google.maps.Map` instance -- real
  // by the time any child renders, but typed unknown through readContext's
  // erasure. Assert the real type here so every subclass gets it for free
  // instead of re-casting at each call site.
  get map() {
    return this.mapContext?.map;
  }

  // Ambient context provided by the nearest <GMap> (v2 facade, replacing the v1
  // curried `this.args.getContext`). Reads the whole provided publicAPI object.
  get mapContext() {
    const ctx = readContext(this);

    // Caveat C1: under a strict resolver the polyfill's VM override may not be
    // active, so context reads `undefined` *silently*. Fail loudly in dev.
    if (DEBUG && ctx === undefined) {
      assert(`<${this.constructor.name}> must be rendered inside <GMap>. ` + `If your app uses the strict resolver, add \`import 'ember-google-maps/setup';\` to your app.js.`, false);
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
  setup() {
    return undefined;
  }
  teardown(mapComponent) {
    this.boundEvents.forEach(({
      remove
    }) => remove());

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
    const ctx = this.mapContext;
    if (ctx && typeof ctx.getComponent === 'function') {
      const {
        remove
      } = ctx.getComponent(this.publicAPI, this.name);
      this.onTeardown = remove;
    }
  }

  /* Events */

  addEventsToMapComponent(mapComponent, events = {}, payload = {}) {
    assert('You need to pass in a map component', mapComponent);
    const boundEvents = addEventListeners(mapComponent, events, payload);
    this.boundEvents.concat(boundEvents);
  }
}
setComponentManager(owner => new MapComponentManager(owner), MapComponent);

export { MapComponentAPI, combine, MapComponent as default };
//# sourceMappingURL=map-component.js.map
