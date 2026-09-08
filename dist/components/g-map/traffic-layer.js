import TypicalMapComponent from './typical-map-component.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';

class TrafficLayer extends TypicalMapComponent {
  get name() {
    return 'trafficLayers';
  }
  newMapComponent(options = {}) {
    return new google.maps.TrafficLayer(options);
  }
  static {
    setComponentTemplate(precompileTemplate("{{yield}}", {
      strictMode: true
    }), this);
  }
}

export { TrafficLayer as default };
//# sourceMappingURL=traffic-layer.js.map
