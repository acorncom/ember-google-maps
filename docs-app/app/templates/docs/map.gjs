import Component from '@glimmer/component';
import { service } from '@ember/service';
import { GMap } from 'ember-google-maps';
import GoogleDocs from '../../components/google-docs.gjs';
import DocsPageFooter from '../../components/docs-page-footer.gjs';

export default class DocsMapPage extends Component {
  @service mapData;

  <template>
    <div class="row">
      <div class="col-lg-7">
        <section>
          <h5 id="creating-a-map">Creating a map</h5>

          <p>Creating a map is straightforward. The only required arguments are
            the coordinates for the center.</p>

          {{! prettier-ignore }}
          <pre><code>&lt;GMap @lat="51.508530" @lng="-0.076132" @zoom=&lbrace;&lbrace;12&rbrace;&rbrace; /&gt;</code></pre>

          <p>To get the map to render, the map canvas needs to be styled with
            dimensions. For example, in your
            <var>app.css</var>:</p>

          {{! prettier-ignore }}
          <pre><code>.ember-google-map {
  width: 500px;
  height: 500px;
}</code></pre>

          <p>Most of the components in this addon accept
            <var>lat</var>
            and
            <var>lng</var>
            parameters for convenience and consistency. This lets you avoid the
            hassle of remembering whether to use
            <var>position</var>
            or
            <var>center</var>
            and lets you provide the coordinates separately. We don't assert the
            usage of
            <var>lat</var>
            and
            <var>lng</var>, so you can still use the native Google options if
            you wish.</p>

          <p>The
            <var>GMap</var>
            component accepts all of the
            <GoogleDocs @section="map#MapOptions">MapOptions</GoogleDocs>
            options you would pass to a Google Map instance. These are
            automatically watched for changes.</p>
        </section>
        <section>
          <h5 id="map-instance">Accessing the map instance</h5>

          <p>If you need to access the map instance — to call
            <var>panTo</var>
            for example — you can use the
            <var>onceOnIdle</var>
            hook. It returns the map instance once the map has been initialized.</p>
        </section>

        <DocsPageFooter />
      </div>
      <div class="col-lg-5 sticky-top sticky-map">
        <GMap
          @lat={{this.mapData.london.lat}}
          @lng={{this.mapData.london.lng}}
          @zoom={{12}}
          @styles={{this.mapData.primaryMapStyle}}
          @minZoom={{10}}
          @panControl={{false}}
          @streetViewControl={{false}}
          class="ember-google-map-responsive"
        />
      </div>
    </div>
  </template>
}
