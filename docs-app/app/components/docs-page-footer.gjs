import Component from '@glimmer/component';
import { service } from '@ember/service';
import { LinkTo } from '@ember/routing';
import { DOCS_LINKS } from '../lib/docs-links.js';

export default class DocsPageFooter extends Component {
  @service router;

  get currentPage() {
    return DOCS_LINKS.find((l) => l.path === this.router.currentRouteName);
  }

  get nextPage() {
    let index = DOCS_LINKS.indexOf(this.currentPage);
    return DOCS_LINKS[index + 1];
  }

  <template>
    {{#if this.nextPage}}
      <p>{{this.nextPage.text}}</p>
      <LinkTo @route={{this.nextPage.path}} class="btn btn-primary">
        {{this.nextPage.title}}
        ›
      </LinkTo>
    {{/if}}
  </template>
}
