# ember-google-maps-directions

Directions, route, and waypoint components for
[ember-google-maps](https://github.com/kaliber5/ember-google-maps). It draws
routes on a map and lets you set waypoints, built on top of the core addon's
map. Route requests run through [ember-concurrency](https://ember-concurrency.com/)
tasks.

## Compatibility

- Ember.js v5.12 or above
- `ember-google-maps` v7.0 or above (peer dependency)

## Installation

```
pnpm add ember-google-maps-directions
```

## Usage

```hbs
{{! Usage snippet — TODO: fill in once the component API lands }}
<GMap @lat={{this.lat}} @lng={{this.lng}} as |g|>
  <g.directions
    @origin={{this.origin}}
    @destination={{this.destination}}
    @waypoints={{this.waypoints}}
  />
</GMap>
```

## License

This project is licensed under the [MIT License](LICENSE.md).
