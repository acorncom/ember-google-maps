# Clustering

Live clustering isn't available yet — the clustering addon hasn't been
ported to the v2 API. See
[issue #22](https://github.com/acorncom/ember-google-maps/issues/22). The
code on this page shows the intended shape of the API, not something you
can install today.

Drawing a lot of markers close together turns into a usability nightmare
fast. Grouping — clustering — markers is the standard way to keep things
readable when you're showing large numbers of them.

Clustering support will come from a separate addon, installed alongside
`ember-google-maps`:

```sh
# Not published yet — tracked in issue #22.
ember install ember-google-maps-clustering
```

It'll wrap [`@googlemaps/markerclusterer`](https://github.com/googlemaps/js-markerclusterer),
Google's own clustering library, and add a `MarkerClusterer` component to
the map. Like any map component, it'll take clustering options directly as
arguments.

::: tip
`MarkerClusterer` will yield its own marker component, meant to be added to
the cluster instead of straight to the map. Don't mix it up with the
regular `Marker` yielded by the map itself.
:::

```gts
import { GMap } from 'ember-google-maps';
import { MarkerClusterer, ClusterMarker } from 'ember-google-maps-clustering';

<template>
  <GMap @lat={{51.507568}} @lng={{-0.127762}} @zoom={{12}}>
    <MarkerClusterer as |cluster|>
      {{#each this.locations key="id" as |location|}}
        <ClusterMarker
          @lat={{location.lat}}
          @lng={{location.lng}}
          @cluster={{cluster}}
        />
      {{/each}}
    </MarkerClusterer>
  </GMap>
</template>
```

## Default cluster icons

The clustering library ships with a small set of default cluster icons.
Expect these to be configurable, mirroring the underlying library — exact
option names will land with the port (issue #22).

## Cluster events

You'll be able to register events the same way as on any other component —
the usual suspects like `@onClick` and `@onDblclick`, plus two
clustering-specific events: `@onClusteringbegin` and `@onClusteringend`.
Keep in mind these can fire more than once during a single render, since
clustering happens in batches.

```gts
<MarkerClusterer
  @onClusteringbegin={{this.onClusteringBegin}}
  @onClusteringend={{this.onClusteringEnd}}
  as |cluster|
>
  {{! ... }}
</MarkerClusterer>
```
