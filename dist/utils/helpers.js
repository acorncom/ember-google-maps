export { clearMapInstances, getMapInstance } from '../component-managers/map-component-manager.js';

function toLatLng(lat, lng) {
  return lat && lng && google?.maps ? new google.maps.LatLng(lat, lng) : undefined;
}

export { toLatLng };
//# sourceMappingURL=helpers.js.map
