import { deprecate } from '@ember/debug';

import BaseGMap from '../components/g-map.gjs';
import { ContextProvider, CONTEXT_KEY } from '../context.js';
import Canvas from '../components/g-map/canvas.gjs';
import Marker from '../components/g-map/marker.gjs';
import AdvancedMarker from '../components/g-map/advanced-marker.gjs';
import InfoWindow from '../components/g-map/info-window.gjs';
import Circle from '../components/g-map/circle.gjs';
import Rectangle from '../components/g-map/rectangle.gjs';
import Polygon from '../components/g-map/polygon.gjs';
import Polyline from '../components/g-map/polyline.gjs';
import TrafficLayer from '../components/g-map/traffic-layer.gjs';
import TransitLayer from '../components/g-map/transit-layer.gjs';
import BicyclingLayer from '../components/g-map/bicycling-layer.gjs';
import Control from '../components/g-map/control.gjs';
import Overlay from '../components/g-map/overlay.gjs';
import Autocomplete from '../components/g-map/autocomplete.gjs';

// Each yielded g.* entry maps to its standalone-import replacement. Importing
// this module pulls in ALL components (the deliberate, deprecated coupling —
// paid only by consumers of the `ember-google-maps/deprecated` entry point).
const YIELDED = [
  ['marker', Marker, 'Marker'],
  ['advancedMarker', AdvancedMarker, 'AdvancedMarker'],
  ['infoWindow', InfoWindow, 'InfoWindow'],
  ['circle', Circle, 'Circle'],
  ['rectangle', Rectangle, 'Rectangle'],
  ['polygon', Polygon, 'Polygon'],
  ['polyline', Polyline, 'Polyline'],
  ['trafficLayer', TrafficLayer, 'TrafficLayer'],
  ['transitLayer', TransitLayer, 'TransitLayer'],
  ['bicyclingLayer', BicyclingLayer, 'BicyclingLayer'],
  ['control', Control, 'Control'],
  ['overlay', Overlay, 'Overlay'],
  ['autocomplete', Autocomplete, 'Autocomplete'],
  ['canvas', Canvas, 'Canvas'],
];

function warnG(name, message) {
  deprecate(message, false, {
    id: `ember-google-maps.g-namespace.${name}`,
    until: '9.0.0',
    for: 'ember-google-maps',
    since: { available: '8.0.0', enabled: '8.0.0' },
  });
}

export default class GMap extends BaseGMap {
  // The yielded deprecated namespace. Getters warn on access, then return the
  // real component (so existing <g.marker/> templates keep working).
  get g() {
    let self = this;

    let api = {
      get map() {
        warnG(
          'map',
          `ember-google-maps: g.map (from <GMap as |g|>) is deprecated and will be removed in v9. ` +
            `Get the google.maps.Map from @onReady instead: <GMap @onReady={{this.onReady}} />.`,
        );
        return self.map;
      },
    };

    for (let [name, Component, exportName] of YIELDED) {
      Object.defineProperty(api, name, {
        enumerable: true,
        get() {
          warnG(
            name,
            `ember-google-maps: <g.${name}> is deprecated and will be removed in v9. ` +
              `Render ${exportName} as a direct child of <GMap>:\n` +
              `  • .gjs/.gts — import { ${exportName} } from 'ember-google-maps'; then <GMap ...><${exportName} ... /></GMap>\n` +
              `  • .hbs — <Gmap${exportName} ... /> (resolves by name, no import)`,
          );
          return Component;
        },
      });
    }

    return api;
  }

  <template>
    <ContextProvider @key={{CONTEXT_KEY}} @value={{this.publicAPI}}>
      {{#if this.renderCanvasInPlace}}
        <Canvas @onCanvasReady={{this.getCanvas}} ...attributes />
      {{/if}}
      {{yield this.g}}
    </ContextProvider>
  </template>
}
