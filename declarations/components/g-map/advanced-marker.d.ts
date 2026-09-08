import type { ComponentLike } from '@glint/template';
import type { MapEvents } from '../../../src/components/g-map/map-component.ts';

// AI-derived and hand-maintained -- treat with extra care and verify against
// Google's docs. AdvancedMarkerElement's headline event is `gmp-click`, but the
// addon binds events by decamelizing the arg name to snake_case (onFooBar ->
// foo_bar), which can't produce a hyphen -- so only the hyphen-free legacy
// events below are reachable through the `on*` convention. Their payloads are
// less standardized than the classic Marker's; revisit as Google's advanced
// marker API and @types/google.maps settle.
export type AdvancedMarkerEvents = MapEvents<
  google.maps.marker.AdvancedMarkerElement,
  {
    click: google.maps.MapMouseEvent;
    drag: google.maps.MapMouseEvent;
    dragstart: google.maps.MapMouseEvent;
    dragend: google.maps.MapMouseEvent;
  }
>;

export interface AdvancedMarkerSignature {
  Args: {
    lat?: number;
    lng?: number;
    // CSS offsets applied to the `<:content>` wrapper as a translate
    // transform, e.g. "-50%"/"-50%" to center content on the position.
    anchorLeft?: string;
    anchorTop?: string;
  } & google.maps.marker.AdvancedMarkerElementOptions &
    AdvancedMarkerEvents;
  Blocks: {
    default: [
      publicAPI: {
        map: google.maps.Map;
        mapComponent: google.maps.marker.AdvancedMarkerElement;
      },
    ];
    // Rendered as the marker's DOM content. `...attributes` (and
    // `@anchorLeft`/`@anchorTop`) apply to this block's wrapper element.
    content: [];
  };
  Element: HTMLDivElement;
}

export declare const AdvancedMarker: ComponentLike<AdvancedMarkerSignature>;
