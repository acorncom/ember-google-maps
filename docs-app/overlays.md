# Custom overlays

Getting your own HTML on the map, instead of the default markers, has
always been a bit of a pain point with Google Maps. Custom marker icons
get you so far, but what if you want to render dynamic content — bound
data, click handlers, CSS animations? That's what an overlay is for.

## What's an overlay?

Google's own docs call this an [`OverlayView`](https://developers.google.com/maps/documentation/javascript/reference/overlay-view).
You add any HTML element to the map as an "overlay" by wiring it up
directly with the Google Maps API in JavaScript. Doing that by hand gets
messy fast. The guides show an example overlaying a section of a terrain
map, which is neat, but the far more common use is custom HTML
markers — markers with real data, real interactions, and real CSS, not
just a static icon.

An `OverlayView` asks you to define three methods: `onAdd`, `draw`, and
`onRemove`. In Ember terms those map almost exactly onto `insert`,
`render`, and `destroy` — three things Ember components already do well.
All that's really needed is to wait for the map to finish loading, then
insert the component into the DOM and register it with the map. The
`Overlay` component handles that (and more) so you don't have to.

## Creating custom overlays

Create a custom overlay with the `Overlay` component. It works like most
other components in this addon, with one twist: pass it a block, and
that block renders on the map.

```hbs
<GMap @lat={{51.5074}} @lng={{-0.1278}} @zoom={{12}}>
  <Overlay @lat={{51.5074}} @lng={{-0.1278}}>
    <div class="my-overlay">Hello, map!</div>
  </Overlay>
</GMap>
```

Your imagination is the limit here. The example below renders a set of
fake rental prices, with a hover effect on each one.

### Example

::: tip
Hover over any price tag to see the hover effect. It's plain CSS — no
JavaScript state involved.
:::

```gts live
import Component from '@glimmer/component';
import { getOwner } from '@ember/owner';
import { GMap, Overlay } from 'ember-google-maps';
import type GoogleMapsApiService from 'ember-google-maps/services/google-maps-api';
import { createLocations } from './lib/create-locations.js';

const LONDON = { lat: 51.507568, lng: -0.127762 };

export default class OverlaysExample extends Component {
  get googleMapsApi() {
    // getOwner(this) is always defined once a component instance exists;
    // the non-null assertion just tells TypeScript what Ember already
    // guarantees at runtime.
    return getOwner(this)!.lookup(
      'service:google-maps-api',
    ) as GoogleMapsApiService;
  }

  get google() {
    return this.googleMapsApi.google;
  }

  get locations() {
    const { maps } = this.google;

    if (!maps) {
      return [];
    }

    const origin = new maps.LatLng(LONDON.lat, LONDON.lng);

    return createLocations(this.google, origin);
  }

  <template>
    <style>
      .eg-overlay-anchor {
        transform: translate(-50%, -100%);
      }

      .eg-price-tooltip {
        padding: 4px 8px;
        border-radius: 4px;
        background: #fff;
        border: 1px solid #999;
        box-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
        font-size: 13px;
        font-weight: bold;
        white-space: nowrap;
        cursor: default;
        transition: transform 0.15s ease, background 0.15s ease, color 0.15s ease;
      }

      .eg-price-tooltip:hover {
        transform: scale(1.2);
        background: #1a73e8;
        color: #fff;
      }
    </style>

    <GMap
      @lat={{LONDON.lat}}
      @lng={{LONDON.lng}}
      @zoom={{13}}
      style="width: 100%; height: 400px;"
    >
      {{#each this.locations key="id" as |location|}}
        <Overlay @lat={{location.lat}} @lng={{location.lng}}>
          <div class="eg-overlay-anchor">
            <div class="eg-price-tooltip">£{{location.price}}</div>
          </div>
        </Overlay>
      {{/each}}
    </GMap>
  </template>
}
```

## Custom options

Two extra arguments beyond position control how the overlay sits on the
map:

`@paneName` — which map pane to render the overlay in. See Google's
[`MapPanes`](https://developers.google.com/maps/documentation/javascript/reference/overlay-view#MapPanes)
docs for the available options. Defaults to `overlayMouseTarget`.

`@zIndex` — sets the `z-index` CSS property on the overlay, for
controlling stacking order against other overlays.

## Positioning the overlay

::: danger
Your overlay content isn't centered on its coordinates by default. You
have to do that yourself.
:::

The overlay is positioned exactly at the coordinates you give it, but the
content inside expands down and to the right, anchored at its top-left
corner. In other words, the top-left of your content sits on the
coordinate — rarely what you actually want.

The `transform` CSS property fixes this. Wrap your content in an element
and apply the transform there, relative to its own size. A couple of
common cases:

### Centering overlay content

To center content directly over its coordinate, offset it by half its own
width and height:

```hbs
<Overlay @lat={{51.5074}} @lng={{-0.1278}}>
  <div style="transform: translate(-50%, -50%);">
    <div class="my-marker">📍</div>
  </div>
</Overlay>
```

Because the offset is a percentage, it scales with the content — if your
element is 100px wide and 100px tall, the transform above moves it 50px
up and 50px left, however big it ends up being.

### Tooltip positioning

Another common need: center the overlay horizontally, but place it above
the coordinate rather than on top of it. This suits tooltips, which
usually have their "tip" pointing down from the middle-bottom of the
element — exactly the pattern used in the price tooltips above.

```hbs
<Overlay @lat={{51.5074}} @lng={{-0.1278}}>
  <div style="transform: translate(-50%, -100%);">
    <div class="my-tooltip">Rent: £1,200/mo</div>
  </div>
</Overlay>
```

Inline styles work, but for anything beyond a quick example you're
better off adding a class to your own stylesheet instead:

```css
.my-tooltip-anchor {
  transform: translate(-50%, -100%);
}
```

You're not limited to percentages either — pixels and any other CSS unit
work the same way.
