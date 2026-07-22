import TypicalMapComponent from './typical-map-component.js';

export default class TrafficLayer extends TypicalMapComponent {
  get name() {
    return 'trafficLayers';
  }

  newMapComponent(options = {}) {
    return new google.maps.TrafficLayer(options);
  }

  <template>{{yield}}</template>
}
