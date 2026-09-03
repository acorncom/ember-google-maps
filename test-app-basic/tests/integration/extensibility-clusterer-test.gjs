import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { setupMapTest } from 'ember-google-maps/test-support';
import { setupLocations } from 'test-app-basic/tests/helpers/locations';
import { render, settled } from '@ember/test-helpers';
import { GMap } from 'ember-google-maps';
import { MarkerClusterer, ClusterMarker } from 'test-addon-clusterer';

// Proves the extensibility surface end-to-end. `test-addon-clusterer`
// is a SEPARATE workspace addon that only imports ember-google-maps' public base
// classes (MapComponent) — no context/registry code — yet its custom container
// component (MarkerClusterer) and leaf component (ClusterMarker) plug into <GMap>,
// get the live map via context, and cluster real markers.
const LOCATIONS = [
  { lat: 51.5, lng: -0.1 },
  { lat: 51.5009, lng: -0.1001 },
  { lat: 51.5011, lng: -0.0999 },
  { lat: 55.9, lng: -3.19 },
];

module('Integration | extensibility | marker clusterer', function (hooks) {
  setupRenderingTest(hooks);
  setupMapTest(hooks);
  setupLocations(hooks);

  test('a third-party custom component clusters real markers via context', async function (assert) {
    await render(
      <template>
        <GMap @lat={{this.lat}} @lng={{this.lng}} @zoom={{5}}>
          <MarkerClusterer as |cluster|>
            {{#each LOCATIONS as |loc|}}
              <ClusterMarker
                @lat={{loc.lat}}
                @lng={{loc.lng}}
                @cluster={{cluster}}
              />
            {{/each}}
          </MarkerClusterer>
        </GMap>
      </template>,
    );

    let {
      components: { markerClusterers, clusterMarkers },
    } = await this.waitForMap();
    await settled();

    assert.strictEqual(
      markerClusterers.length,
      1,
      'the custom container component registered with <GMap> via context',
    );
    assert.strictEqual(
      clusterMarkers.length,
      LOCATIONS.length,
      'every custom child component registered',
    );

    let clusterer = markerClusterers[0].mapComponent;

    // The clusterer received all the markers (fed from its trackedSet).
    assert.strictEqual(
      clusterer.markers.length,
      LOCATIONS.length,
      'all markers handed to the clusterer',
    );

    // And it produced clusters (the 3 tight London points collapse; Edinburgh
    // stays separate) — i.e. fewer rendered clusters than raw markers.
    assert.ok(clusterer.clusters.length >= 1, 'at least one cluster rendered');
    assert.ok(
      clusterer.clusters.length < LOCATIONS.length,
      `fewer clusters (${clusterer.clusters.length}) than markers (${LOCATIONS.length})`,
    );
  });
});
