import TypicalMapComponent from './typical-map-component.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';

class BicyclingLayer extends TypicalMapComponent {
  get name() {
    return 'bicyclingLayers';
  }
  newMapComponent(options = {}) {
    return new google.maps.BicyclingLayer(options);
  }
  static {
    setComponentTemplate(precompileTemplate("{{yield}}", {
      strictMode: true
    }), this);
  }
}

export { BicyclingLayer as default };
//# sourceMappingURL=bicycling-layer.js.map
