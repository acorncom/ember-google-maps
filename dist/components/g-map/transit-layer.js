import TypicalMapComponent from './typical-map-component.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';

class TransitLayer extends TypicalMapComponent {
  get name() {
    return 'transitLayers';
  }
  newMapComponent(options = {}) {
    return new google.maps.TransitLayer(options);
  }
  static {
    setComponentTemplate(precompileTemplate("{{yield}}", {
      strictMode: true
    }), this);
  }
}

export { TransitLayer as default };
//# sourceMappingURL=transit-layer.js.map
