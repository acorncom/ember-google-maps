export function trigger(component, eventName, ...options) {
  google.maps.event.trigger(component, eventName, ...options);
}
