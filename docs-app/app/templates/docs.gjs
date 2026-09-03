import NavMain from '../components/nav-main.gjs';
import FooterMain from '../components/footer-main.gjs';
import { DOCS_LINKS } from '../lib/docs-links.js';

<template>
  <div class="container-fluid">
    <div class="d-md-flex">
      <div class="col-sidebar">
        <NavMain @links={{DOCS_LINKS}} />
      </div>
      <div class="col flex-1">
        <main>
          {{outlet}}
        </main>
        <FooterMain />
      </div>
    </div>
  </div>
</template>
