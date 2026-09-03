import { deprecate } from '@ember/debug';
import GMap$1 from '../components/g-map.js';
import { CONTEXT_KEY } from '../context.js';
import Canvas from '../components/g-map/canvas.js';
import Marker from '../components/g-map/marker.js';
import AdvancedMarker from '../components/g-map/advanced-marker.js';
import InfoWindow from '../components/g-map/info-window.js';
import Circle from '../components/g-map/circle.js';
import Rectangle from '../components/g-map/rectangle.js';
import Polygon from '../components/g-map/polygon.js';
import Polyline from '../components/g-map/polyline.js';
import TrafficLayer from '../components/g-map/traffic-layer.js';
import TransitLayer from '../components/g-map/transit-layer.js';
import BicyclingLayer from '../components/g-map/bicycling-layer.js';
import Control from '../components/g-map/control.js';
import Overlay from '../components/g-map/overlay.js';
import Autocomplete from '../components/g-map/autocomplete.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import ContextProvider from 'ember-provide-consume-context/components/context-provider';

const YIELDED = [['marker', Marker, 'Marker'], ['advancedMarker', AdvancedMarker, 'AdvancedMarker'], ['infoWindow', InfoWindow, 'InfoWindow'], ['circle', Circle, 'Circle'], ['rectangle', Rectangle, 'Rectangle'], ['polygon', Polygon, 'Polygon'], ['polyline', Polyline, 'Polyline'], ['trafficLayer', TrafficLayer, 'TrafficLayer'], ['transitLayer', TransitLayer, 'TransitLayer'], ['bicyclingLayer', BicyclingLayer, 'BicyclingLayer'], ['control', Control, 'Control'], ['overlay', Overlay, 'Overlay'], ['autocomplete', Autocomplete, 'Autocomplete'], ['canvas', Canvas, 'Canvas']];
function warnG(name, message) {
  deprecate(message, false, {
    id: `ember-google-maps.g-namespace.${name}`,
    until: '9.0.0',
    for: 'ember-google-maps',
    since: {
      available: '8.0.0',
      enabled: '8.0.0'
    }
  });
}
class GMap extends GMap$1 {
  // The yielded deprecated namespace. Getters warn on access, then return the
  // real component (so existing <g.marker/> templates keep working).
  get g() {
    let self = this;
    let api = {
      get map() {
        warnG('map', `ember-google-maps: g.map (from <GMap as |g|>) is deprecated and will be removed in v9. ` + `Get the google.maps.Map from @onReady instead: <GMap @onReady={{this.onReady}} />.`);
        return self.map;
      }
    };
    for (let [name, Component, exportName] of YIELDED) {
      Object.defineProperty(api, name, {
        enumerable: true,
        get() {
          warnG(name, `ember-google-maps: <g.${name}> is deprecated and will be removed in v9. ` + `Render ${exportName} as a direct child of <GMap>:\n` + `  • .gjs/.gts — import { ${exportName} } from 'ember-google-maps'; then <GMap ...><${exportName} ... /></GMap>\n` + `  • .hbs — <Gmap${exportName} ... /> (resolves by name, no import)`);
          return Component;
        }
      });
    }
    return api;
  }
  static {
    setComponentTemplate(precompileTemplate("<ContextProvider @key={{CONTEXT_KEY}} @value={{this.publicAPI}}>\n  {{#if this.renderCanvasInPlace}}\n    <Canvas @onCanvasReady={{this.getCanvas}} ...attributes />\n  {{/if}}\n  {{yield this.g}}\n</ContextProvider>", {
      strictMode: true,
      scope: () => ({
        ContextProvider,
        CONTEXT_KEY,
        Canvas
      })
    }), this);
  }
}

export { GMap as default };
//# sourceMappingURL=g-map.js.map
