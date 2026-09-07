# Map

## Creating a map

Creating a map is straightforward. The only required arguments are the coordinates for the center.

```hbs
<GMap @lat="51.508530" @lng="-0.076132" @zoom={{12}} />
```

To get the map to render, the map canvas needs to be styled with dimensions. For example, in your `app.css`:

```css
.ember-google-map {
  width: 500px;
  height: 500px;
}
```

Most of the components in this addon accept `lat` and `lng` parameters for convenience and consistency. This lets you avoid the hassle of remembering whether to use `position` or `center` and lets you provide the coordinates separately. We don't assert the usage of `lat` and `lng`, so you can still use the native Google options if you wish.

The `GMap` component accepts all of the [MapOptions](https://developers.google.com/maps/documentation/javascript/reference/map#MapOptions) options you would pass to a Google Map instance. These are automatically watched for changes.

## Example

```gts live
import { GMap } from 'ember-google-maps';
import { dark } from './map-styles/dark.js';

<template>
  <GMap
    @lat={{51.507568}}
    @lng={{-0.127762}}
    @zoom={{12}}
    @styles={{dark}}
    @minZoom={{10}}
    @panControl={{false}}
    @streetViewControl={{false}}
    style="width: 100%; height: 400px;"
  />
</template>
```

## Accessing the map instance

If you need to access the map instance — to call `panTo` for example — you can use the `onceOnIdle` hook. It returns the map instance once the map has been initialized.
