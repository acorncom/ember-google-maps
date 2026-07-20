// Deprecated entry point: the yielded `<GMap as |g|>` namespace bridge.
//
// Import GMap from here to keep v1-style templates (`<g.marker/>`, `{{g.map}}`,
// `<g.canvas/>`) working during migration — each g.* access emits a deprecation
// pointing at its standalone-import replacement. This entry point is deliberately
// NOT tree-shakeable (it pulls in every component); that cost is paid only by
// consumers who import from here. Fresh code should use the tree-shakeable
// `import { GMap, Marker, … } from 'ember-google-maps'` instead.
export { default as GMap } from './deprecated/g-map.gjs';
