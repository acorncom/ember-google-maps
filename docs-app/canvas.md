# Canvas

`Canvas` renders the `div` that actually contains the map. You'll rarely
reach for it directly — by default, `GMap` renders one for you
automatically, and every example on this site so far has relied on that.

If you do want to control it yourself, `GMap` accepts a
`renderCanvasInPlace` argument — set it to `false` to opt out of the
automatic canvas, so you can place `Canvas` — with your own classes, or
wherever you want it in your markup — instead:

```hbs
<GMap @lat={{51.5074}} @lng={{-0.1278}} @renderCanvasInPlace={{false}}>
  <Canvas class="my-custom-canvas" />
</GMap>
```

::: warning
This opt-out path is a known gap in the current v2 rewrite: placing
`Canvas` yourself doesn't yet receive the "map is ready" handoff that
`GMap` wires up for its own automatic canvas, so the map never actually
mounts. This is tracked in [issue #10](https://github.com/acorncom/ember-google-maps/issues/10).
Until that's fixed, stick with the automatic canvas.

The good news is you don't need `Canvas` at all for the common reason
you'd reach for it — positioning other elements above or below the map.
Since `GMap` only ever renders that one canvas `div`, plain HTML around
`<GMap>` gets you the same result without any styling hacks:
:::

## Example

```gjs live
import { GMap, Marker } from 'ember-google-maps';

<template>
  <div style="display: flex; flex-direction: column; gap: 0.75rem;">
    <input
      type="text"
      aria-label="An element that needs to be above the map."
      placeholder="I need to be above the map!"
    />

    <GMap
      @lat={{51.507568}}
      @lng={{-0.127762}}
      @zoom={{12}}
      style="width: 100%; height: 350px;"
    >
      <Marker @lat={{51.507568}} @lng={{-0.127762}} />
    </GMap>

    <input
      type="text"
      aria-label="An element that needs to be below the map."
      placeholder="I need to be below the map!"
    />
  </div>
</template>
```
