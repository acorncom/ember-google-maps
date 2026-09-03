import Service from '@ember/service';
import { service } from '@ember/service';
import darkStyle from '../map-styles/dark.js';
import lightStyle from '../map-styles/light.js';

export default class MapDataService extends Service {
  @service googleMapsApi;

  get google() {
    return this.googleMapsApi.google;
  }

  london = { lat: 51.507568, lng: -0.127762 };
  primaryMapStyle = darkStyle;
  lightStyle = lightStyle;
}
