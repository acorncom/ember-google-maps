import ContextProvider from 'ember-provide-consume-context/components/context-provider';
import { getContext } from 'ember-provide-consume-context';

// The single module that owns the context identifier and the only place allowed
// to touch `ember-provide-consume-context`. When native RFC 1200 context lands,
// this module is the swap point (design D8 / §4.6) — the base class and <GMap>
// go through `readContext`/`ContextProvider`/`CONTEXT_KEY`, never the polyfill.
const CONTEXT_KEY = 'ember-google-maps';

export { ContextProvider, CONTEXT_KEY };

// Read the value provided by the nearest <GMap>. Returns the whole provided
// object (the GMap publicAPI) or undefined if there is no provider / context is
// inactive (see caveat C1 — silent undefined under a strict resolver without
// `ember-google-maps/setup`).
export function readContext(obj) {
  return getContext(obj, CONTEXT_KEY);
}
