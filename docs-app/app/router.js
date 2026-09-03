import EmberRouter from '@embroider/router';
import config from 'docs-app/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('not-found', { path: '/*path' });
  this.route('index', { path: '/' });
  this.route('docs', function () {
    this.route('getting-started');
    this.route('map');
  });
});
