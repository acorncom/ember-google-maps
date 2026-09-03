import Route from '@ember/routing/route';
import { service } from '@ember/service';

export default class DocsIndexRoute extends Route {
  @service router;

  beforeModel() {
    this.router.transitionTo('docs.getting-started');
  }
}
