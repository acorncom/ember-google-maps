import {
  clearMapInstances,
  getMapInstance,
} from '../component-managers/map-component-manager.js';

function toLatLng(lat, lng) {
  return lat && lng && google?.maps
    ? new google.maps.LatLng(lat, lng)
    : undefined;
}

export { clearMapInstances, getMapInstance, toLatLng };
