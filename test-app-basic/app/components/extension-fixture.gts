// Regression coverage for extension authors subclassing TypicalMapComponent
// in real TypeScript. Not rendered anywhere — this file exists to be
// typechecked. Confirms TypicalMapComponent's generic MapInstance param
// (typical-map-component.ts) lets a subclass return its own real Google
// Maps object from setup()/update(), instead of fighting a hardcoded
// setMap()/setOptions() shape that not every real Google Maps class
// implements the same way.
import { assert } from '@ember/debug';

import { TypicalMapComponent } from 'ember-google-maps';
import type {
  MapComponentSignature,
  MapEvent,
  MapEvents,
} from 'ember-google-maps';

// AdvancedMarkerElement has no setMap() -- it attaches via a `.map`
// property instead -- so this subclass overrides setup() entirely, the
// same pattern the addon's own (untyped) AdvancedMarker component uses.
export class CustomAdvancedMarker extends TypicalMapComponent<
  MapComponentSignature,
  google.maps.marker.AdvancedMarkerElement
> {
  newMapComponent(
    options: google.maps.marker.AdvancedMarkerElementOptions,
  ): google.maps.marker.AdvancedMarkerElement {
    return new google.maps.marker.AdvancedMarkerElement(options);
  }

  setup(): google.maps.marker.AdvancedMarkerElement {
    let mapComponent = this.newMapComponent(this.newOptions);
    mapComponent.map = this.map;
    return mapComponent;
  }
}

// google.maps.Data DOES have setMap()/setOptions() -- but with real,
// specific parameter types, not the base's permissive `unknown`. This
// subclass relies entirely on the base implementation.
export class CustomDataLayer extends TypicalMapComponent<
  MapComponentSignature,
  google.maps.Data
> {
  // DataOptions.map is required at construction (unlike Marker/Circle/etc,
  // which take a map later via setMap()) -- newMapComponent's parameter
  // stays Record<string, unknown> (the base's own type, what the options/
  // events split actually passes in) and supplies `map` itself.
  newMapComponent(options: Record<string, unknown>): google.maps.Data {
    let { map } = this;
    assert('CustomDataLayer must be rendered inside <GMap>', map);

    return new google.maps.Data({ ...options, map });
  }
}

// The addon ships event maps for its own built-in leaves, but a downstream
// author subclassing TypicalMapComponent wraps their own google object -- here
// google.maps.Data, which the addon has no component for. They get real,
// typo-safe event args by composing the exported `MapEvents` builder over their
// object's events, exactly the way the built-in leaves do.
//
// This map is AI-derived from google.maps.Data's documented events and
// hand-maintained: verify against Google's docs and update it when Google
// changes Data's events. (Same discipline as the addon's built-in maps.)
type DataEvents = MapEvents<
  google.maps.Data,
  {
    addfeature: google.maps.Data.AddFeatureEvent;
    setgeometry: google.maps.Data.SetGeometryEvent;
    setproperty: google.maps.Data.SetPropertyEvent;
    click: google.maps.Data.MouseEvent;
    dblclick: google.maps.Data.MouseEvent;
    mouseover: google.maps.Data.MouseEvent;
    mouseout: google.maps.Data.MouseEvent;
  }
>;

interface CustomDataWithEventsSignature {
  Args: { style?: google.maps.Data.StylingFunction } & DataEvents;
  Blocks: { default: [] };
  Element: null;
}

export class CustomDataLayerWithEvents extends TypicalMapComponent<
  CustomDataWithEventsSignature,
  google.maps.Data
> {
  newMapComponent(options: Record<string, unknown>): google.maps.Data {
    let { map } = this;
    assert('CustomDataLayerWithEvents must be rendered inside <GMap>', map);

    return new google.maps.Data({ ...options, map });
  }
}

// type-level proof the composed handler is real: onClick's arg is a MapEvent
// carrying a google.maps.Data.MouseEvent, so its `feature` is reachable.
type DataOnClick = NonNullable<
  CustomDataWithEventsSignature['Args']['onClick']
>;
const _dataClick: DataOnClick = (
  event: MapEvent<google.maps.Data.MouseEvent, google.maps.Data>,
) => void event.googleEvent.feature;
void _dataClick;
