import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { waitFor } from '@ember/test-waiters';
import { DEBUG } from '@glimmer/env';
import MapComponent from './g-map/map-component.js';
import Canvas from './g-map/canvas.js';
import { CONTEXT_KEY } from '../context.js';
import { toLatLng } from '../utils/helpers.js';
import { registerMapInstance } from '../component-managers/map-component-manager.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import { g, i, n } from 'decorator-transforms/runtime-esm';
import ContextProvider from 'ember-provide-consume-context/components/context-provider';

const IDLE_FALLBACK_MS = 3000;
// The value provided to context and read by child map components. A thin
// delegating wrapper over the live GMap instance: `map` (the google.maps.Map)
// and `getComponent` (child registration).
function GMapPublicAPI(source) {
  return {
    get map() {
      return source.map;
    },
    // Registered child components grouped by their `name` (markers, circles, …).
    // Read by test-support's waitForMap() and the deprecated `<GMap as |g|>`
    // `g.components` API. Coupling-free — a registry of whatever registered.
    get components() {
      return source.deprecatedPublicComponents;
    },
    getComponent: (component, as = 'other') => source.getComponent(component, as)
  };
}
let GMap$1 = class GMap extends MapComponent {
  static {
    g(this.prototype, "canvas", [tracked]);
  }
  #canvas = (i(this, "canvas"), void 0);
  components = new Set();
  get publicAPI() {
    return GMapPublicAPI(this);
  }
  get map() {
    return this.mapComponent;
  }
  // GMap is the context *provider* (the root map); it does not register with a
  // parent and never reads ambient context (which would trip the base assert).
  register() {}
  // Render the canvas ourselves unless the consumer opts out to place <Canvas>
  // themselves. (Replaces the v1 `has-block-params` heuristic — design §6.)
  get renderCanvasInPlace() {
    return this.args.renderCanvasInPlace !== false;
  }
  get newOptions() {
    this.options.zoom ??= 15;
    if (!this.args.center) {
      this.options.center = toLatLng(this.args.lat, this.args.lng);
    }
    return this.options;
  }
  setup(options, events) {
    let map = new google.maps.Map(this.canvas, this.newOptions);
    this.addEventsToMapComponent(map, events, this.publicAPI);
    // New v2 API: hand the consumer the google.maps.Map instance.
    this.args.onReady?.(map);
    if (DEBUG) {
      this.pauseTestForIdle(map);
    }
    return map;
  }
  update(map) {
    map.setOptions(this.newOptions);
    if (DEBUG) {
      this.pauseTestForIdle(map);
    }
    return map;
  }
  // Pause tests until the map is idle.
  //
  // The `idle` event only fires once the map actually settles. When a map is
  // created (or updated) and then torn down before it settles — e.g. a fast
  // route transition that mounts a map and immediately redirects away — `idle`
  // never fires. Without a fallback this @waitFor promise stays pending forever,
  // holding `settled()` open until the test hits its timeout instead of failing
  // (or passing) promptly. Race the `idle` listener against a fallback timeout
  // and always clean up both, so the promise settles either way. This runs only
  // in DEBUG/test builds, so the fallback has no production effect.
  async pauseTestForIdle(map) {
    await new Promise(resolve => {
      let settled = false;
      let finish = () => {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        google.maps.event.removeListener(listener);
        resolve(map);
      };
      let listener = google.maps.event.addListenerOnce(map, 'idle', finish);
      let timer = setTimeout(finish, IDLE_FALLBACK_MS);
    });
  }
  static {
    n(this.prototype, "pauseTestForIdle", [waitFor]);
  }
  getCanvas(canvas) {
    this.canvas = canvas;
    if (DEBUG) {
      registerMapInstance(canvas.id, this.publicAPI);
    }
  }
  static {
    n(this.prototype, "getCanvas", [action]);
  }
  getComponent(component, as = 'other') {
    let storedComponent = {
      component,
      as
    };
    this.components.add(storedComponent);
    this.addToDeprecatedPublicComponents(storedComponent);
    return {
      context: this.publicAPI,
      remove: () => {
        this.components.delete(storedComponent);
        this.removeFromDeprecatedPublicComponents(storedComponent);
      }
    };
  }
  // Grouped view of registered components (`{ markers: [...], circles: [...] }`),
  // exposed as `publicAPI.components`. Ported from v1 g-map.js.
  static {
    n(this.prototype, "getComponent", [action]);
  }
  deprecatedPublicComponents = {};
  addToDeprecatedPublicComponents({
    as,
    component
  }) {
    if (!(as in this.deprecatedPublicComponents)) {
      this.deprecatedPublicComponents[as] = [];
    }
    this.deprecatedPublicComponents[as].push(component);
  }
  removeFromDeprecatedPublicComponents({
    as,
    component
  }) {
    let group = this.deprecatedPublicComponents[as];
    let index = group.indexOf(component);
    if (index > -1) {
      group.splice(index, 1);
    }
    // For backwards compatibility, we don't remove the groups when they're empty.
  }
  static {
    setComponentTemplate(precompileTemplate("<ContextProvider @key={{CONTEXT_KEY}} @value={{this.publicAPI}}>\n  {{#if this.renderCanvasInPlace}}\n    <Canvas @onCanvasReady={{this.getCanvas}} ...attributes />\n  {{/if}}\n  {{yield}}\n</ContextProvider>", {
      strictMode: true,
      scope: () => ({
        ContextProvider,
        CONTEXT_KEY,
        Canvas
      })
    }), this);
  }
};

export { GMap$1 as default };
//# sourceMappingURL=g-map.js.map
