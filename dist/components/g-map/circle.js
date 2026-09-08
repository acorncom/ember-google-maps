import Marker from './marker.js';
import { toLatLng } from '../../utils/helpers.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';

class Circle extends Marker {
  get name() {
    return 'circles';
  }
  get newOptions() {
    this.options.radius ??= 500;
    if (!this.args.center) {
      this.options.center = toLatLng(this.args.lat, this.args.lng);
    }
    return this.options;
  }
  newMapComponent(options = {}) {
    return new google.maps.Circle(options);
  }
  static {
    setComponentTemplate(precompileTemplate("{{yield}}", {
      strictMode: true
    }), this);
  }
}

export { Circle as default };
//# sourceMappingURL=circle.js.map
