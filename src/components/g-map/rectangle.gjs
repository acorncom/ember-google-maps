import TypicalMapComponent from './typical-map-component.ts';

export default class Rectangle extends TypicalMapComponent {
  get name() {
    return 'rectangles';
  }

  newMapComponent(options = {}) {
    return new google.maps.Rectangle(options);
  }

  <template>{{yield}}</template>
}
