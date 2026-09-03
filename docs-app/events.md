# Events

## Handling events

Arguments prefixed with `on` are reserved by this addon. The prefix is
stripped, the rest of the name is decamelized, and whatever you passed in
gets bound to the resulting event name. Google's event names don't always
match what you're used to from Ember, so it's worth checking Google's own
API docs for each component.

As an example, to register a handler for the `bounds_changed` event, pass an
action to `@onBoundsChanged`. For `dragend`, use `@onDragend`.

```hbs
<GMap
  @lat={{51.5074}}
  @lng={{-0.1278}}
  @onBoundsChanged={{this.onBoundsChanged}}
  @onDragend={{this.onDragend}}
/>
```

::: warning
Some of Google's event names break the expected naming style. `dragend` is
a single word, not two words joined by an underscore — that carries
straight through to the camelized name, so you would **not** capitalize the
`e` in `onDragend`.
:::

Every map component this addon ships follows this convention. It keeps the
addon lightweight and decoupled from the underlying API — if an event or
option name changes on Google's end, this addon doesn't need to be
updated, only your own code does.

Each handler receives whatever arguments you passed it in the template,
plus an event object. That event object serves two purposes. First, it
gives you a pile of information about what happened. Second, and more
usefully, it gives you access to a set of functions that let you react to
the event right away.

| Property | Description |
| --- | --- |
| `event` | The native DOM `window.event` object. |
| `googleEvent` | Google Maps' own event object, which may carry extra map-specific detail. |
| `eventName` | The name of the event that fired. |
| `target` | The component or element that triggered the event — the map itself, a marker, or a plain HTML element. |
| `publicAPI` | The public objects and methods exposed by the map component that registered the event, including the component instance itself. |
| `map` | The parent [`google.maps.Map`](https://developers.google.com/maps/documentation/javascript/reference/map#Map) instance. |

## Example

The map below has five event listeners wired up — see if you can find them
all by panning, clicking, double-clicking, and zooming.

```gjs live
import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { fn } from '@ember/helper';
import { GMap } from 'ember-google-maps';

export default class EventsExample extends Component {
  @tracked message =
    'Pan, click, double-click, or zoom the map to see events fire here.';

  @action
  flash(text) {
    this.message = text;
  }

  <template>
    <p><strong>{{this.message}}</strong></p>
    <GMap
      @lat={{51.507568}}
      @lng={{-0.127762}}
      @zoom={{12}}
      style="width: 100%; height: 400px;"
      @onceOnIdle={{fn this.flash "The map is here. Well, give it a wave!"}}
      @onBoundsChanged={{fn this.flash "The bounds have changed!"}}
      @onClick={{fn this.flash "You clicked the map!"}}
      @onDblclick={{fn this.flash "Ooh, a double click!!"}}
      @onZoomChanged={{fn this.flash "Zoooooom!"}}
    />
  </template>
}
```

## Event propagation

Sometimes you need to stop an event from propagating up the DOM tree.

A common case is click events on markers and overlays. If you bind a click
handler on a marker to show a tooltip, and a second click handler on the
map to close all open tooltips, your tooltips will never open — a click on
the marker triggers the tooltip, then the same event bubbles up to the map
and immediately closes it again.

There are two ways around this: refactor your code so the bubbling doesn't
matter, or stop the event from bubbling in the first place.

You can stop it by calling `stopPropagation` on the event object your
handler receives:

```js
import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class Example extends Component {
  @action
  onMarkerClick(event) {
    event.stopPropagation();

    // ...
  }
}
```
