import DocTip from './doc-tip.gjs';

<template>
  <DocTip
    @cardClassNames="doc-danger"
    @badgeClassNames="text-bg-danger"
    @badgeText={{if @badgeText @badgeText "Warning"}}
    ...attributes
  >
    {{yield}}
  </DocTip>
</template>
