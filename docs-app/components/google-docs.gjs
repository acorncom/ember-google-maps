import Component from '@glimmer/component';

const REFERENCE_URL =
  'https://developers.google.com/maps/documentation/javascript/reference/';
const GUIDE_URL =
  'https://developers.google.com/maps/documentation/javascript/';

export default class GoogleDocs extends Component {
  get type() {
    return this.args.type ?? 'reference';
  }

  get baseUrl() {
    return this.type === 'reference' ? REFERENCE_URL : GUIDE_URL;
  }

  get href() {
    return this.baseUrl + this.args.section;
  }

  <template>
    <a
      href={{this.href}}
      rel="noopener noreferrer nofollow"
      target="_blank"
      ...attributes
    >{{yield}}</a>
  </template>
}
