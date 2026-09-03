import DocsPageFooter from '../../components/docs-page-footer.gjs';

<template>
  <div class="col-text">
    <section>
      <h5>Installation</h5>

      {{! prettier-ignore }}
      <pre><code>ember install ember-google-maps</code></pre>
    </section>
    <section>
      <h5>Loading Google Maps</h5>

      <p>You can configure the options used for loading the Google Maps API in
        your app's
        <var>config/environment.js</var>. The
        <var>key</var>
        option is
        <b>required</b>. Everything else is optional, however, I strongly
        suggest explicitly setting the language and version options to avoid any
        nasty surprises.</p>

      <p>As your app is built, these options will be used to generate the URL
        for the API. The API is automatically loaded — on-demand — only when it
        is needed.</p>

      {{! prettier-ignore }}
      <pre><code>ENV['ember-google-maps'] = {
  key: process.env.GOOGLE_MAPS_API_KEY, // Using .env files in this example
  language: 'en',
  region: 'GB',
  protocol: 'https',
  version: '3.55',
  libraries: ['geometry', 'places'], // Optional libraries
};</code></pre>

      <p>If your requirements are more complex and statically building the URL
        is too restrictive, you can always override the URL at runtime (the
        "advanced" page covers this — coming soon).</p>
    </section>

    <DocsPageFooter />
  </div>
</template>
