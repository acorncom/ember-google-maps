# Getting started

## Installation

```sh
ember install ember-google-maps
```

## Loading Google Maps

You can configure the options used for loading the Google Maps API in your app's `config/environment.js`. The `key` option is **required**. Everything else is optional, however, I strongly suggest explicitly setting the language and version options to avoid any nasty surprises.

As your app is built, these options will be used to generate the URL for the API. The API is automatically loaded — on-demand — only when it is needed.

```js
ENV['ember-google-maps'] = {
  key: process.env.GOOGLE_MAPS_API_KEY, // Using .env files in this example
  language: 'en',
  region: 'GB',
  protocol: 'https',
  version: '3.55',
  libraries: ['geometry', 'places'], // Optional libraries
};
```

If your requirements are more complex and statically building the URL is too restrictive, you can always override the URL at runtime (the "advanced" page covers this — coming soon).
