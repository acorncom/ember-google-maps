# Info windows

## Creating info windows

These are your basic, run-of-the-mill white tooltips. They're not as
customizable as a fully custom overlay, but they can be quite useful since
they "just work."

The `InfoWindow` component accepts three arguments worth knowing about:
`isOpen`, `content`, and `target`. For everything else, check Google's own
[`InfoWindowOptions`](https://developers.google.com/maps/documentation/javascript/reference/info-window#InfoWindowOptions)
docs.

`isOpen` controls whether the tooltip is open, `true` or `false`. It
reverts back to `false` on its own when the user closes the window, so
keep your own state in sync with an `@onCloseclick` handler.

`content` takes a string — plain text or HTML — to render inside the
tooltip. If you want to render real HTML (or a component), use the block
form instead: anything you put in the block renders inside the info
window.

`target` attaches the info window to another map component, such as a
marker. Skip it and the info window attaches to the map itself, positioned
by `lat`/`lng` (or you can set those directly to reposition it).

```hbs
<GMap @lat={{51.5074}} @lng={{-0.1278}} @zoom={{12}}>
  <InfoWindow
    @lat={{51.5074}}
    @lng={{-0.1278}}
    @isOpen={{this.mapTooltipOpen}}
    @onCloseclick={{this.closeMapTooltip}}
    @content="<i>Simple text tooltip</i>"
  />

  <Marker
    @lat={{51.5074}}
    @lng={{-0.1278}}
    @onClick={{this.markerClicked}}
    as |m|
  >
    <InfoWindow
      @target={{m.mapComponent}}
      @isOpen={{this.markerTooltipOpen}}
      @onCloseclick={{this.closeMarkerTooltip}}
    >
      <div>Custom <i>HTML</i> content in an info window!</div>
    </InfoWindow>
  </Marker>
</GMap>
```

## Example

Click the marker to toggle its tooltip, or use the checkboxes below. The
map also has its own info window, attached directly to the map rather than
to the marker.

::: tip
The `run()` calls below are only there because this live example runs in a
sandbox with no Ember event dispatcher, so a plain `on "click"` handler on
a checkbox doesn't get wrapped in a runloop for free. In a real Ember app
you'd just write `this.markerTooltipOpen = !this.markerTooltipOpen` — no
`run()` needed. The `@onClick`/`@onCloseclick` handlers below are Google
Maps events routed through the addon's own event system, so they don't
need it either — only the plain DOM checkboxes do.
:::

```gts live
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { run } from '@ember/runloop';
import { on } from '@ember/modifier';
import { GMap, Marker, InfoWindow } from 'ember-google-maps';

const LONDON = { lat: 51.507568, lng: -0.127762 };

// VitePress serves the public/ directory under the site's configured
// `base` (`/ember-google-maps/` for this site). Markdown-rendered images
// get that prefix applied automatically, but a hard-coded string inside a
// live component doesn't — so build the URL from Vite's own BASE_URL.
const DOGE_IMAGE = `${import.meta.env.BASE_URL}images/doge.jpg`;

export default class InfoWindowsExample extends Component {
  @tracked mapTooltipOpen = false;
  @tracked markerTooltipOpen = false;

  // Toggled from the plain DOM checkboxes below.
  toggleMapTooltipCheckbox = () => {
    // run() is only needed in this live docs sandbox (no Ember event
    // dispatcher to wrap the handler in a runloop); a real Ember app
    // doesn't need it.
    run(() => (this.mapTooltipOpen = !this.mapTooltipOpen));
  };

  toggleMarkerTooltipCheckbox = () => {
    run(() => (this.markerTooltipOpen = !this.markerTooltipOpen));
  };

  // Google Maps events, routed through the addon's own event system — no
  // run() needed here.
  markerClicked = () => {
    this.markerTooltipOpen = !this.markerTooltipOpen;
  };

  closeMapTooltip = () => {
    this.mapTooltipOpen = false;
  };

  closeMarkerTooltip = () => {
    this.markerTooltipOpen = false;
  };

  <template>
    <p>
      <label>
        <input
          type="checkbox"
          checked={{this.mapTooltipOpen}}
          {{on "click" this.toggleMapTooltipCheckbox}}
        />
        Toggle map tooltip
      </label>
      <br />
      <label>
        <input
          type="checkbox"
          checked={{this.markerTooltipOpen}}
          {{on "click" this.toggleMarkerTooltipCheckbox}}
        />
        Toggle marker tooltip
      </label>
    </p>

    <GMap
      @lat={{LONDON.lat}}
      @lng={{LONDON.lng}}
      @zoom={{12}}
      style="width: 100%; height: 400px;"
    >
      <InfoWindow
        @lat={{LONDON.lat}}
        @lng={{LONDON.lng}}
        @isOpen={{this.mapTooltipOpen}}
        @onCloseclick={{this.closeMapTooltip}}
        @content="<i>Simple text tooltip</i>"
      />

      <Marker
        @lat={{LONDON.lat}}
        @lng={{LONDON.lng}}
        @onClick={{this.markerClicked}}
        as |m|
      >
        <InfoWindow
          @target={{m.mapComponent}}
          @isOpen={{this.markerTooltipOpen}}
          @onCloseclick={{this.closeMarkerTooltip}}
        >
          <div style="text-align: center;">
            <img src="{{DOGE_IMAGE}}" alt="Such doge!" width="200" />
            <div>Custom <i>HTML</i> content in an info window!</div>
          </div>
        </InfoWindow>
      </Marker>
    </GMap>
  </template>
}
```
