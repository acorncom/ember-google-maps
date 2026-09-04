import DefaultTheme from 'vitepress/theme';
// Import after 'vitepress/theme' so its :root overrides win the cascade
// (both custom.css and the default theme's vars.css set --vp-c-brand-*
// on :root at equal specificity; DOM/module-evaluation order decides,
// and vitepress/theme's own CSS is a side effect of the import above).
import './custom.css';
import { setupEmber } from 'vite-plugin-ember/setup';
import { getOwner } from '@ember/owner';
import GoogleMapsApiServiceBase from 'ember-google-maps/services/google-maps-api';
import { MapComponentManager } from 'ember-google-maps/component-managers/map-component-manager';
import { initialize as initializeProvideConsumeContext } from 'ember-provide-consume-context/initializers/glimmer-overrides';
import type { Theme } from 'vitepress';

// The minimal owner vite-plugin-ember provides doesn't implement
// resolveRegistration('config:environment'), which the real
// _getConfig() calls. Override it directly instead.
class GoogleMapsApiService extends GoogleMapsApiServiceBase {
  _getConfig() {
    // eslint-disable-next-line no-undef
    return { key: __DOCS_GOOGLE_MAPS_KEY__, libraries: ['geometry', 'places', 'marker'] };
  }
}

// Fix 2: ember-provide-consume-context's context wiring is a plain
// function that monkeypatches @glimmer/runtime's VM, normally run as an
// Ember app initializer. vite-plugin-ember runs no initializers, so call
// it ourselves, once, before anything renders.
initializeProvideConsumeContext();

// Fix 3: @service injection on a plain (non-EmberObject) class -- like
// MapComponentManager -- goes through Ember's internal
// ComputedDescriptor/meta caching system, which silently fails here.
// Bypass it with a direct, public getOwner(this).lookup(...) call
// instead. This is a docs-only workaround; it does not touch
// ember-google-maps itself.
Object.defineProperty(MapComponentManager.prototype, 'googleMapsApi', {
  configurable: true,
  get() {
    return getOwner(this).lookup('service:google-maps-api');
  },
});

export default {
  ...DefaultTheme,
  enhanceApp({ app }) {
    setupEmber(app, {
      services: {
        'google-maps-api': new GoogleMapsApiService(),
      },
    });
  },
} satisfies Theme;
