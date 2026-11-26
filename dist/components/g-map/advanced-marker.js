import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { htmlSafe } from '@ember/template';
import TypicalMapComponent from './typical-map-component.js';
import { toLatLng } from '../../utils/helpers.js';
import didInsert from '../../modifiers/g-map/did-insert.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import { g, i, n } from 'decorator-transforms/runtime-esm';

class AdvancedMarker extends TypicalMapComponent {
  // Detached host for a `<:content>` block; Google relocates the wrapper into
  // the marker once it becomes the element's `content` (same pattern as Overlay).
  container = window?.document?.createElement('div');
  // The wrapper element rendered from the `<:content>` block, captured on insert.
  static {
    g(this.prototype, "contentElement", [tracked]);
  }
  #contentElement = (i(this, "contentElement"), void 0);
  get name() {
    return 'advancedMarkers';
  }
  get newOptions() {
    if (!this.args.position) {
      this.options.position = toLatLng(this.args.lat, this.args.lng);
    }
    // A `<:content>` block becomes the marker's content DOM. It takes
    // precedence over a `@content` element (which otherwise flows through
    // options untouched).
    if (this.contentElement) {
      this.options.content = this.contentElement;
    }
    return this.options;
  }
  // AdvancedMarkerElement attaches to the map via the `map` property — it has NO
  // `setMap()` method (unlike the legacy Marker), so we can't inherit
  // TypicalMapComponent.setup (which calls setMap). Override to assign `.map`.
  setup() {
    let mapComponent = this.newMapComponent(this.newOptions);
    this.addEventsToMapComponent(mapComponent, this.events, this.publicAPI);
    mapComponent.map = this.map;
    return mapComponent;
  }
  update(mapComponent) {
    Object.assign(mapComponent, this.newOptions);
    return mapComponent;
  }
  newMapComponent(options = {}) {
    return new google.maps.marker.AdvancedMarkerElement(options);
  }
  // AdvancedMarkerElement anchors its content's bottom-center at the position.
  // `@anchorLeft`/`@anchorTop` shift the content via a CSS translate so callers
  // can re-anchor (e.g. center a dot with "-50%"/"-50%").
  get anchorStyle() {
    let {
      anchorLeft,
      anchorTop
    } = this.args;
    if (anchorLeft == null && anchorTop == null) {
      return undefined;
    }
    return htmlSafe(`transform: translate(${anchorLeft ?? '0'}, ${anchorTop ?? '0'});`);
  }
  captureContent(element) {
    this.contentElement = element;
  }
  static {
    n(this.prototype, "captureContent", [action]);
  }
  static {
    setComponentTemplate(precompileTemplate("{{#if (has-block \"content\")}}\n  {{#in-element this.container}}\n    <div {{didInsert this.captureContent}} ...attributes style={{this.anchorStyle}}>\n      {{yield to=\"content\"}}\n    </div>\n  {{/in-element}}\n{{/if}}\n{{yield this.publicAPI}}", {
      strictMode: true,
      scope: () => ({
        didInsert
      })
    }), this);
  }
}

export { AdvancedMarker as default };
//# sourceMappingURL=advanced-marker.js.map
