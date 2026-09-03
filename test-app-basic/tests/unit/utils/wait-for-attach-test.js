import { module, test } from 'qunit';
import { destroy } from '@ember/destroyable';
import { settled } from '@ember/test-helpers';
import { getPendingWaiterState } from '@ember/test-waiters';
import {
  attachWaiter,
  waitForAttach,
} from 'ember-google-maps/utils/wait-for-attach';

// Deterministic, no real Google Maps involved: waitForAttach only cares about
// DOM connectivity and MutationObserver, so we can reproduce the exact race
// it guards against -- an element pushed somewhere before it's connected --
// with plain elements. This is what a real Control does with a Google-owned
// container instead of `container` here.
//
// getPendingWaiterState() reports waiter state synchronously, so these don't
// need to race real timers the way an integration test racing real Google
// Maps timing would (see the accompanying control-test.gjs regression test
// and its caveat comment for why that one couldn't reliably reproduce the
// original bug on its own).
function isPending() {
  return Boolean(getPendingWaiterState().waiters[attachWaiter.name]);
}

module('Unit | utils | wait-for-attach', function (hooks) {
  hooks.beforeEach(function () {
    this.owner = {};
    this.container = document.createElement('div');
    document.body.appendChild(this.container);
  });

  hooks.afterEach(function () {
    document.body.removeChild(this.container);
  });

  test('holds settled() open while the element is detached, and releases once it attaches', async function (assert) {
    let element = document.createElement('div');

    waitForAttach(this.owner, element, this.container);

    assert.true(
      isPending(),
      'waiter is pending immediately -- the element is not connected yet',
    );

    this.container.appendChild(element);

    // The waiter releases via a MutationObserver callback, which fires as a
    // microtask -- settled() is what actually waits for it here.
    await settled();

    assert.false(isPending(), 'waiter released once the element attached');
  });

  test('does not engage at all when the element is already connected', function (assert) {
    let element = document.createElement('div');
    this.container.appendChild(element);

    waitForAttach(this.owner, element, this.container);

    assert.false(
      isPending(),
      'no waiter opened -- there is nothing to wait for on the happy path',
    );
  });

  test('releases via the timeout bound if the element never attaches', async function (assert) {
    let element = document.createElement('div'); // never appended anywhere

    waitForAttach(this.owner, element, this.container, 10);

    assert.true(isPending(), 'waiter is pending right after the call');

    await settled();

    assert.false(
      isPending(),
      'waiter released via the timeout bound, not a real attach',
    );
  });

  test('releases on destroy if the element never attaches', async function (assert) {
    let element = document.createElement('div'); // never appended anywhere

    // A long timeout: if this test passes, it's because destroy() released
    // the waiter, not the bound.
    waitForAttach(this.owner, element, this.container, 60_000);

    assert.true(isPending(), 'waiter is pending right after the call');

    destroy(this.owner);
    await settled();

    assert.false(isPending(), 'waiter released on destroy()');
  });

  test('a mutation unrelated to the element does not release the waiter early', async function (assert) {
    let element = document.createElement('div'); // never appended
    let unrelated = document.createElement('span');

    // A long bound: this test is only meaningful if nothing releases the
    // waiter before the assertion below runs. We can't await settled() to
    // give the MutationObserver a turn -- settled() itself can't resolve
    // while the waiter is (deliberately, here) still pending.
    waitForAttach(this.owner, element, this.container, 60_000);

    this.container.appendChild(unrelated);
    await new Promise((resolve) => setTimeout(resolve, 20));

    assert.true(
      isPending(),
      'an unrelated mutation inside the container does not release the waiter',
    );

    destroy(this.owner); // release it now rather than waiting out the bound
    await settled();
  });
});
