# Testing

[Learn how and why to test your Ember apps →](https://guides.emberjs.com/release/testing/)

Maps introduce two extra complications to testing.

The first is timing. How do you know when to run the tests? Is the map
ready? Are the components there yet?

The second is interaction. There's no guarantee any of the map components
even have DOM elements to interact with, and Google Maps doesn't provide an
official API for labelling, finding, and interacting with things drawn on
the map. So you generally can't just find a marker and click on it the way
you'd click a button.

Both of these are tackled by helpers exported from
`ember-google-maps/test-support`: `setupMapTest`, `waitForMap`, and
`trigger`.

`setupMapTest` is a test hook, similar in spirit to `setupRenderingTest` and
`setupApplicationTest`. Run it once in your test module and it sets up
tracking for any maps rendered during the test, clearing that tracking
again afterwards. It also binds `waitForMap` onto the test context as
`this.waitForMap`.

`waitForMap` lets you pause the test while a map is still rendering. Once
the map is idle, it resolves with the map's public API: `{ map, components,
getComponent }`. `map` is the raw `google.maps.Map` instance, and
`components` groups every registered child component by name (`markers`,
`circles`, and so on). You can use those instances to simulate a user
interacting with the map.

`trigger` fires a Google Maps event directly on a component instance —
handy since Google Maps events aren't real DOM events, so `click()` from
`@ember/test-helpers` won't do anything useful on them.

Let's make this concrete with a sample acceptance test.

## Acceptance testing

Say you draw a marker in your app that should show a popup with some text
when it's clicked.

```hbs
<GMap @lat={{51.507568}} @lng={{-0.127762}} @zoom={{12}}>
  <Marker @lat={{51.507568}} @lng={{-0.127762}} @onClick={{this.showPopup}} />
</GMap>

{{#if this.showingPopup}}
  <div data-test-popup>Hello, London!</div>
{{/if}}
```

That popup matters to your app, so you'd like to be sure it actually shows.
Here's how you'd test that.

```js
import { module, test } from 'qunit';
import { setupApplicationTest } from 'ember-qunit';
import { visit } from '@ember/test-helpers';
import { setupMapTest, trigger } from 'ember-google-maps/test-support';

module('Acceptance | map popup', function (hooks) {
  setupApplicationTest(hooks);
  setupMapTest(hooks);

  test('clicking a marker shows the popup', async function (assert) {
    await visit('/');

    let { components } = await this.waitForMap();
    let [marker] = components.markers;

    trigger(marker.mapComponent, 'click');

    assert.dom('[data-test-popup]').exists();
  });
});
```

If you're wondering how to pick one marker out of hundreds, remember you
can always pass extra arguments to a component — Google Maps objects
happily carry custom properties, so you can read them back later.

```hbs
<Marker @lat={{location.lat}} @lng={{location.lng}} @id={{location.id}} />
```

```js
let { components } = await this.waitForMap();
let marker = components.markers.find(
  (m) => m.mapComponent.get('id') === targetId,
);
```

## Multiple maps on the same page

If, for some reason, you've got more than one map visible in a single test,
tell them apart with an `id`.

In your template, pass an `id` to the map:

```hbs
<GMap id="second-map" @lat={{40.7128}} @lng={{-74.0060}} @zoom={{10}} />
```

Then, in your test, pass that same `id` to `waitForMap`:

```js
let { map } = await this.waitForMap('second-map');
```

## Integration testing

For maps, integration testing isn't much different from acceptance
testing. Run the `setupMapTest` hook and use `waitForMap` to wait for the
map to render. Don't forget to wait for it — even if you don't need any of
the instances it returns, you still need the map to have settled before
you can assert anything about it.

```js
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import { setupMapTest } from 'ember-google-maps/test-support';
import { GMap } from 'ember-google-maps';

module('Integration | Component | my-map', function (hooks) {
  setupRenderingTest(hooks);
  setupMapTest(hooks);

  test('it renders a map', async function (assert) {
    await render(
      <template><GMap @lat={{51.5}} @lng={{-0.1}} @zoom={{10}} /></template>,
    );

    await this.waitForMap();

    assert.dom('.ember-google-map').exists();
  });
});
```
