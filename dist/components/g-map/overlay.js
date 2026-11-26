import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { guidFor } from '@ember/object/internals';
import MapComponent from './map-component.js';
import { toLatLng } from '../../utils/helpers.js';
import didInsert from '../../modifiers/g-map/did-insert.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import { g, i, n } from 'decorator-transforms/runtime-esm';

class Overlay extends MapComponent {
  id = `ember-google-maps-overlay-${guidFor(this)}`;
  static {
    g(this.prototype, "container", [tracked], function () {
      return window?.document?.createElement('div');
    });
  }
  #container = (i(this, "container"), void 0);
  get name() {
    return 'overlays';
  }
  get zIndex() {
    return this.args.zIndex ?? 'auto';
  }
  get paneName() {
    return this.args.paneName ?? 'overlayMouseTarget';
  }
  get position() {
    let {
      lat,
      lng,
      position
    } = this.args;
    return position ?? toLatLng(lat, lng);
  }
  setup() {
    let Overlay = new google.maps.OverlayView();
    Overlay.onAdd = () => this.onAdd();
    Overlay.onRemove = () => this.onRemove();
    Overlay.draw = () => this.draw();
    // Make sure we don’t run “draw” before Google Maps has done so first.
    Overlay.didDraw = false;
    Overlay.setMap(this.map);
    // Explicitly track options here, as the Google Maps performs the setup
    // asynchronously.
    return [Overlay, Object.values(this.options)];
  }
  // TODO: support changing pane?
  update(overlay) {
    if (overlay.didDraw) {
      overlay.draw();
    }
  }
  onAdd() {
    let panes = this.mapComponent.getPanes();
    this.targetPane = panes[this.paneName];
    this.targetPane.appendChild(this.overlayElement);
    this.addEventsToMapComponent(this.overlayElement, this.events, this.publicAPI);
  }
  draw() {
    let {
      position,
      zIndex
    } = this;
    let overlayProjection = this.mapComponent.getProjection();
    let point = overlayProjection.fromLatLngToDivPixel(position);
    this.overlayElement.style.cssText = `
      position: absolute;
      left: 0;
      top: 0;
      height: 0;
      z-index: ${zIndex};
      transform: translateX(${point.x}px) translateY(${point.y}px);
    `;
    this.mapComponent.didDraw ||= true;
  }
  onRemove() {
    let parentNode = this.overlayElement.parentNode;
    if (parentNode) {
      parentNode.removeChild(this.overlayElement);
    }
  }
  teardown() {
    // This calls onRemove.
    this.mapComponent?.setMap(null);
    this.overlayElement = null;
    this.container = null;
  }
  getOverlay(element) {
    this.overlayElement = element;
  }
  static {
    n(this.prototype, "getOverlay", [action]);
  }
  static {
    setComponentTemplate(precompileTemplate("{{#if (has-block)}}\n  {{#if this.container}}\n    {{#in-element this.container}}\n      <div id={{this.id}} ...attributes {{didInsert this.getOverlay}}>{{yield}}</div>\n    {{/in-element}}\n  {{/if}}\n{{/if}}", {
      strictMode: true,
      scope: () => ({
        didInsert
      })
    }), this);
  }
}

export { Overlay as default };
//# sourceMappingURL=overlay.js.map
