// Strict-resolver apps only: `import 'ember-google-maps/setup';` once in app.js
// to activate the provide/consume context VM override. Classic/@embroider/compat
// apps auto-run the polyfill's initializer and MUST NOT import this (initialize()
// is not idempotent — a double call double-patches the VM; see design §5).
//
// Listed in package.json "sideEffects" so it is never tree-shaken.
import { initialize } from 'ember-provide-consume-context/initializers/glimmer-overrides';

initialize();
