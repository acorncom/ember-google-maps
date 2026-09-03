import TypicalMapComponent from './typical-map-component.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';

class Polygon extends TypicalMapComponent {
  get name() {
    return 'polygons';
  }
  newMapComponent(options = {}) {
    return new google.maps.Polygon(options);
  }
  static {
    setComponentTemplate(precompileTemplate("{{yield}}", {
      strictMode: true
    }), this);
  }
}

export { Polygon as default };
//# sourceMappingURL=polygon.js.map
