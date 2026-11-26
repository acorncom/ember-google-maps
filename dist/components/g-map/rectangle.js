import TypicalMapComponent from './typical-map-component.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';

class Rectangle extends TypicalMapComponent {
  get name() {
    return 'rectangles';
  }
  newMapComponent(options = {}) {
    return new google.maps.Rectangle(options);
  }
  static {
    setComponentTemplate(precompileTemplate("{{yield}}", {
      strictMode: true
    }), this);
  }
}

export { Rectangle as default };
//# sourceMappingURL=rectangle.js.map
