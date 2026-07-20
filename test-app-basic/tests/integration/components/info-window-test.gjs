import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMapTest, trigger } from 'ember-google-maps/test-support';
import { setupLocations } from 'test-app-basic/tests/helpers/locations';
import { find, render, waitFor, waitUntil } from '@ember/test-helpers';
import { tracked } from '@glimmer/tracking';
import { GMap, Marker, InfoWindow } from 'ember-google-maps';
import { toLatLng } from 'ember-google-maps/utils/helpers';

// Ported from legacy/tests/integration/components/g-map/info-window-test.js to
// the v2 import API. The v1 standalone `<g.infoWindow>` becomes `<InfoWindow>`;
// the v1 marker-attached `<m.infoWindow>` yield becomes the tree-shakeable
// `<Marker as |m|><InfoWindow @target={{m.mapComponent}} /></Marker>`.
function isVisible(infoWindow) {
  return infoWindow.getMap() && infoWindow.getPosition();
}

class State {
  @tracked isOpen = false;
  @tracked infoWindowLat;
  @tracked infoWindowLng;
}

module('Integration | Component | info-window', function (hooks) {
  setupRenderingTest(hooks);
  setupMapTest(hooks);
  setupLocations(hooks);

  hooks.beforeEach(function () {
    this.getFirstInfoWindow = async () => {
      let {
        components: { infoWindows },
      } = await this.waitForMap();

      return infoWindows[0].mapComponent;
    };
  });

  test('it registers an info window', async function (assert) {
    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}}>
          <InfoWindow
            @lat={{this.lat}}
            @lng={{this.lng}}
            @isOpen={{false}}
            @content="test"
          />
        </GMap>
      </template>,
    );

    let {
      components: { infoWindows },
    } = await this.waitForMap();

    assert.strictEqual(infoWindows.length, 1);

    let infoWindow = infoWindows[0].mapComponent;
    assert.ok(infoWindow);
  });

  test('it opens an info window when isOpen is set to true', async function (assert) {
    const state = new State();

    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}}>
          <InfoWindow
            @lat={{this.lat}}
            @lng={{this.lng}}
            @isOpen={{state.isOpen}}
            @content="Opening an info window!"
          />
        </GMap>
      </template>,
    );

    let infoWindow = await this.getFirstInfoWindow();

    assert.notOk(isVisible(infoWindow));

    state.isOpen = true;

    await this.waitForMap();

    assert.ok(isVisible(infoWindow));
  });

  test('it renders an info window with custom html passed using the content attribute', async function (assert) {
    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}}>
          <InfoWindow
            @lat={{this.lat}}
            @lng={{this.lng}}
            @isOpen={{true}}
            @content="<div id='info-window-test'>Content rendering test!</div>"
          />
        </GMap>
      </template>,
    );

    let infoWindow = await this.getFirstInfoWindow();

    // Google paints string content into the bubble a beat after open, so wait
    // for it (the block-form case below does the same).
    let infoWindowElement = await waitFor('#info-window-test');

    assert.ok(infoWindowElement, 'rendered info window content');
    assert.ok(isVisible(infoWindow), 'info window is visible');
  });

  test('it renders an info window with custom html passed as a block', async function (assert) {
    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}}>
          <InfoWindow @lat={{this.lat}} @lng={{this.lng}} @isOpen={{true}}>
            <div id="info-window-test">Custom HTML block test!</div>
          </InfoWindow>
        </GMap>
      </template>,
    );

    let infoWindow = await this.getFirstInfoWindow();

    let infoWindowElement = await waitFor('#info-window-test');

    assert.ok(infoWindowElement, 'rendered info window content');
    assert.ok(isVisible(infoWindow), 'info window is visible');
  });

  test('it attaches an info window to a marker', async function (assert) {
    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}} @zoom={{6}}>
          <Marker @lat={{55}} @lng={{2}} as |m|>
            <InfoWindow
              @target={{m.mapComponent}}
              @isOpen={{true}}
              @content="Testing info windows attached to markers"
            />
          </Marker>
        </GMap>
      </template>,
    );

    let infoWindow = await this.getFirstInfoWindow();

    // Wait until Google Maps updates the position value.
    await waitUntil(() => isVisible(infoWindow));

    assert.deepEqual(infoWindow.getPosition().toJSON(), { lat: 55, lng: 2 });
  });

  test('it closes the info window when isOpen is set to false', async function (assert) {
    const state = new State();
    state.isOpen = true;

    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}} @zoom={{6}}>
          <Marker @lat={{55}} @lng={{2}} as |m|>
            <InfoWindow @target={{m.mapComponent}} @isOpen={{state.isOpen}}>
              <div id="info-window-test">
                An info window attached to a marker!
              </div>
            </InfoWindow>
          </Marker>
        </GMap>
      </template>,
    );

    let infoWindow = await this.getFirstInfoWindow();
    await waitUntil(() => isVisible(infoWindow));

    assert.ok(find('#info-window-test'));
    assert.ok(isVisible(infoWindow));

    state.isOpen = false;

    await this.waitForMap();

    assert.notOk(find('#info-window-test'));
    assert.notOk(isVisible(infoWindow));
  });

  test('it closes the info window when the close button is clicked', async function (assert) {
    const state = new State();
    state.isOpen = true;

    this.closeInfoWindow = () => {
      state.isOpen = false;
    };

    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}} @zoom={{6}}>
          <Marker @lat={{55}} @lng={{2}} as |m|>
            <InfoWindow
              @target={{m.mapComponent}}
              @isOpen={{state.isOpen}}
              @onCloseclick={{this.closeInfoWindow}}
              @content="<div id='info-window-test'>Testing the close button!</div>"
            />
          </Marker>
        </GMap>
      </template>,
    );

    let infoWindow = await this.getFirstInfoWindow();

    assert.ok(find('#info-window-test'));
    await waitUntil(() => isVisible(infoWindow));
    assert.ok(isVisible(infoWindow), 'info window is visible');

    trigger(infoWindow, 'closeclick');

    await this.waitForMap();

    assert.notOk(find('#info-window-test'), 'info window is not in DOM');
    assert.notOk(isVisible(infoWindow), 'info window is not visible');
    assert.false(state.isOpen, 'isOpen is set to false');
  });

  test('it updates the infoWindow’s position', async function (assert) {
    const state = new State();
    state.infoWindowLat = this.lat;
    state.infoWindowLng = this.lng;

    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}} @zoom={{6}}>
          <InfoWindow
            @lat={{state.infoWindowLat}}
            @lng={{state.infoWindowLng}}
            @isOpen={{true}}
            @content="test"
          />
        </GMap>
      </template>,
    );

    let infoWindow = await this.getFirstInfoWindow();

    let newLatLng = google.maps.geometry.spherical.computeOffset(
      toLatLng(state.infoWindowLat, state.infoWindowLng),
      500,
      0,
    );

    state.infoWindowLat = newLatLng.lat();
    state.infoWindowLng = newLatLng.lng();

    await this.waitForMap();

    assert.ok(
      newLatLng.equals(infoWindow.getPosition()),
      'info window position updated',
    );
  });
});
