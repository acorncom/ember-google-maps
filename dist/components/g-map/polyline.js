import TypicalMapComponent from './typical-map-component.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';

class Polyline extends TypicalMapComponent {
  get name() {
    return 'polylines';
  }
  newMapComponent(options = {}) {
    return new google.maps.Polyline(options);
  }
  static {
    setComponentTemplate(precompileTemplate("{{yield}}", {
      strictMode: true
    }), this);
  }
}

export { Polyline as default };
//# sourceMappingURL=polyline.js.map
