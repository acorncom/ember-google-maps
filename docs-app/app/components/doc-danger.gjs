import DocTip from './doc-tip.gjs';

<template>
  <DocTip
    @cardClassNames="doc-danger"
    @badgeClassNames="badge-danger"
    @badgeText={{if @badgeText @badgeText "Warning"}}
    ...attributes
  >
    {{yield}}
  </DocTip>
</template>
