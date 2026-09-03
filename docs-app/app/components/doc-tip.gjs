import Component from '@glimmer/component';

export default class DocTip extends Component {
  defaultBadgeText = 'Tip';
  defaultCardClassNames = 'doc-tip';
  // Bootstrap 5 dropped the `.badge-{color}` variants in favor of pairing
  // the base `.badge` class with a `.text-bg-{color}` helper.
  defaultBadgeClassNames = 'text-bg-primary';

  get cardClassNames() {
    return this.args.cardClassNames ?? this.defaultCardClassNames;
  }

  get badgeClassNames() {
    return this.args.badgeClassNames ?? this.defaultBadgeClassNames;
  }

  get badgeText() {
    return this.args.badgeText ?? this.defaultBadgeText;
  }

  <template>
    <div class="doc-card {{this.cardClassNames}}" ...attributes>
      <p class="m-0">
        {{#if this.badgeText}}
          <span class="badge {{this.badgeClassNames}}">{{this.badgeText}}</span>
        {{/if}}
        {{yield}}
      </p>
    </div>
  </template>
}
