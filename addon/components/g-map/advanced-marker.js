import TypicalMapComponent from './typical-map-component';
import { toLatLng } from '../../utils/helpers';
import { modifier } from 'ember-modifier';

export default class AdvancedMarker extends TypicalMapComponent {
  domElement = undefined;

  initContent = modifier((element) => {
    this.domElement = element;
  });

  get name() {
    return 'advancedMarkers';
  }

  get newOptions() {
    if (!this.args.position) {
      this.options.position = toLatLng(this.args.lat, this.args.lng);
    }

    return {
      ...this.options,
      ...{
        content: this.domElement,
      },
    };
  }

  update(mapComponent) {
    Object.assign(mapComponent, this.newOptions);
    return mapComponent;
  }

  newMapComponent(options = {}) {
    return new google.maps.marker.AdvancedMarkerElement({
      ...options,
      ...{
        content: this.domElement,
      },
    });
  }
}
