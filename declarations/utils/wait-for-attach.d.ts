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
export function waitForAttach(owner: any, element: any, container: any, timeout?: number): void;
export const attachWaiter: import("@ember/test-waiters").TestWaiter<unknown>;
//# sourceMappingURL=wait-for-attach.d.ts.map