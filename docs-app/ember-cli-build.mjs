import EmberApp from 'ember-cli/lib/broccoli/ember-app.js';
import { compatBuild } from '@embroider/compat';
import { buildOnce } from '@embroider/vite';

export default async function (defaults) {
  const app = new EmberApp(defaults, {
    // Add options here
  });

  return compatBuild(app, buildOnce);
}
