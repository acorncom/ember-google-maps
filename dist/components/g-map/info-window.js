import MapComponent from './map-component.js';
import { tracked } from '@glimmer/tracking';
import { toLatLng } from '../../utils/helpers.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import { g, i } from 'decorator-transforms/runtime-esm';

class InfoWindow extends MapComponent {
  get name() {
    return 'infoWindows';
  }
  get isOpen() {
    return Boolean(this.infoWindow.getMap());
  }
  // TODO: Sanitize this.args.content?
  get content() {
    return this.args.content ?? this.container;
  }
  // Can’t use a fragment here because Google Maps consumes it.
  static {
    g(this.prototype, "container", [tracked], function () {
      return window?.document?.createElement('div');
    });
  }
  #container = (i(this, "container"), void 0);
  get newOptions() {
    let options = this.options;
    if (!options.target && !this.args.position) {
      options.position = toLatLng(this.args.lat, this.args.lng);
    }
    if (options.isOpen) {
      options.content = this.content;
    }
    return options;
  }
  setup() {
    let infoWindow = new google.maps.InfoWindow(this.newOptions);
    // This is kind of annoying. Maybe we can refactor stuff to not use `this`.
    this.infoWindow = infoWindow;
    this.addEventsToMapComponent(infoWindow, this.events, this.publicAPI);
    this.toggleOpen();
    return infoWindow;
  }
  update(infoWindow) {
    infoWindow.setOptions(this.newOptions);
    this.toggleOpen();
  }
  toggleOpen() {
    let shouldBeOpen = this.args.isOpen ?? false;
    if (shouldBeOpen === this.isOpen) {
      return;
    }
    if (shouldBeOpen) {
      this.open();
    } else {
      this.close();
    }
  }
  open() {
    this.infoWindow.open(this.map, this.options.target);
  }
  close() {
    this.infoWindow.close();
  }
  static {
    setComponentTemplate(precompileTemplate("{{#if this.container}}\n  {{#in-element this.container}}\n    {{#if (has-block)}}\n      {{yield this.publicAPI}}\n    {{else}}\n      {{this.content}}\n    {{/if}}\n  {{/in-element}}\n{{/if}}", {
      strictMode: true
    }), this);
  }
}

export { InfoWindow as default };
//# sourceMappingURL=info-window.js.map
