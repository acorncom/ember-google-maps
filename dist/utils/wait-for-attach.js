import { registerDestructor } from '@ember/destroyable';
import { buildWaiter } from '@ember/test-waiters';

// Shared across every call site (currently just <Control>) so there is a
// single named waiter to introspect in tests, rather than one per instance.
const attachWaiter = buildWaiter('ember-google-maps:element-attach-waiter');

/**
 * Holds `settled()` open until `element` is connected to the DOM somewhere
 * inside `container`, or `timeout` ms pass, whichever comes first.
 *
 * Google Maps attaches some elements (map controls, in particular) into the
 * live map DOM asynchronously, with no event to await. Without this,
 * `settled()` can resolve while the element is still detached, so a
 * rendering test that interacts with it fails intermittently ("element not
 * found"). See sandydoo/ember-google-maps#11.
 *
 * No-ops if `element` is already connected -- the common case once a map has
 * finished laying out -- so there is no observer/timer overhead on the
 * happy path.
 *
 * `owner` is passed to `registerDestructor` so the wait ends promptly if the
 * caller is torn down before the element ever attaches (e.g. a re-render
 * during setup), rather than leaking the waiter token to the timeout bound.
 * It does not need to be a real Ember object -- `registerDestructor` accepts
 * any object, as long as something eventually calls `destroy(owner)` on it
 * (the map component manager does this for real <Control> instances).
 */
function waitForAttach(owner, element, container, timeout = 5000) {
  if (element.isConnected) return;
  let token = attachWaiter.beginAsync();
  let observer;
  let timeoutId;
  let finished = false;
  let finish = () => {
    if (finished) return;
    finished = true;
    clearTimeout(timeoutId);
    observer.disconnect();
    attachWaiter.endAsync(token);
  };
  observer = new MutationObserver(() => {
    if (element.isConnected) finish();
  });
  observer.observe(container, {
    childList: true,
    subtree: true
  });
  timeoutId = setTimeout(finish, timeout);
  registerDestructor(owner, finish);
}

export { attachWaiter, waitForAttach };
//# sourceMappingURL=wait-for-attach.js.map
