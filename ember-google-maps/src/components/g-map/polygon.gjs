import TypicalMapComponent from './typical-map-component.js';

// (v1 legacy had this class misnamed `Polyline` — fixed to `Polygon`, which also
// corrects the `<${constructor.name}>` dev assert message.)
export default class Polygon extends TypicalMapComponent {
  get name() {
    return 'polygons';
  }

  newMapComponent(options = {}) {
    return new google.maps.Polygon(options);
  }

  <template>{{yield}}</template>
}
