import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMapTest } from 'ember-google-maps/test-support';
import { setupLocations } from 'test-app-basic/tests/helpers/locations';
import { render, waitFor } from '@ember/test-helpers';
import { tracked } from '@glimmer/tracking';
import { GMap, Control } from 'ember-google-maps';

// Ported from legacy/tests/integration/components/g-map/control-test.js to the
// v2 import API. Uses waitFor (with a timeout) for the control element, since
// Google Maps attaches pushed controls asynchronously.
const timeoutForElements = 5000;

class State {
  @tracked position = 'TOP_CENTER';
}

module('Integration | Component | control', function (hooks) {
  setupRenderingTest(hooks);
  setupMapTest(hooks);
  setupLocations(hooks);

  test('it renders a custom control', async function (assert) {
    const state = new State();

    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}} @zoom={{12}}>
          <Control @position={{state.position}}>
            <div id="custom-control">Hi there</div>
          </Control>
        </GMap>
      </template>,
    );

    let {
      map,
      components: { controls },
    } = await this.waitForMap();

    assert.strictEqual(controls.length, 1);

    let control = await waitFor('#custom-control', {
      timeout: timeoutForElements,
    });
    assert.ok(control, 'control rendered');

    let mapControls = map.controls[google.maps.ControlPosition[state.position]];
    assert.deepEqual(
      controls[0].mapComponent,
      mapControls.getAt(0),
      'control rendered in correct position',
    );

    state.position = 'BOTTOM_CENTER';
    await this.waitForMap();

    let newMapControls =
      map.controls[google.maps.ControlPosition[state.position]];
    assert.strictEqual(
      mapControls.length,
      0,
      'controls removed from previous position',
    );
    assert.strictEqual(newMapControls.length, 1, 'control now in new position');
  });

  // Regression test for sandydoo/ember-google-maps#11: Google Maps attaches a
  // pushed control element into the live map DOM asynchronously, with no event
  // to await. Before the control-attach test waiter, settled() could resolve
  // while the control was still detached -- this exact assertion (no waitFor,
  // no extra timeout, just settled() via render()) was the flake. Every other
  // test in this file works around it with an explicit waitFor(); this one
  // deliberately does not, so it fails again if the waiter regresses.
  test('the control element is attached by the time render() settles, with no extra wait', async function (assert) {
    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}} @zoom={{12}}>
          <Control @position="TOP_CENTER">
            <div id="no-wait-control">Hi there</div>
          </Control>
        </GMap>
      </template>,
    );

    assert
      .dom('#no-wait-control')
      .exists('control is already attached once render() settles');
  });

  test('it renders a control with a class value', async function (assert) {
    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}} @zoom={{12}}>
          <Control @position="TOP_CENTER" class="custom-control-holder">
            <div id="custom-control"></div>
          </Control>
        </GMap>
      </template>,
    );

    let control = await waitFor('.custom-control-holder', {
      timeout: timeoutForElements,
    });

    assert.ok(control, 'control rendered');
  });

  test('it renders several controls in the same position', async function (assert) {
    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}} @zoom={{12}}>
          <Control @position="TOP_CENTER" @index={{1}}>
            <div id="second-control">Second</div>
          </Control>

          <Control @position="TOP_CENTER" @index={{0}}>
            <div id="first-control">First</div>
          </Control>
        </GMap>
      </template>,
    );

    let control1 = await waitFor('#first-control', {
      timeout: timeoutForElements,
    });
    let control2 = await waitFor('#second-control', {
      timeout: timeoutForElements,
    });

    assert.ok(control1, 'control rendered');
    assert.ok(control2, 'control rendered');

    let parent1 = control1.parentElement;
    let parent2 = control2.parentElement;

    // The 'first-control' should render to the left of the other control. These
    // are positioned absolutely, so compare their left offsets.
    assert.ok(
      parent1.offsetLeft < parent2.offsetLeft,
      'controls rendered in correct order',
    );
  });
});
