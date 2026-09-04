import { defineConfig } from 'vitepress';
import vitePluginEmber, { emberFence } from 'vite-plugin-ember';

// Fix 1: vite-plugin-ember's shim for @embroider/macros's importSync
// throws unconditionally instead of attempting real resolution.
// ember-provide-consume-context's one importSync(...) call site is a
// macroCondition(dependencySatisfies('ember-source', '>=4.10.0')) branch
// that a real Embroider build would dead-code-eliminate into a plain
// static import. Our ember-source (~6.12.0) always satisfies that
// branch, so rewrite the call site to a plain static import ourselves.
function patchImportSync() {
  return {
    name: 'docs-patch-importsync',
    enforce: 'pre' as const,
    transform(code: string, id: string) {
      if (!id.includes('ember-provide-consume-context')) return null;
      if (!code.includes("importSync('@ember/owner').getOwner")) return null;
      const patched = code
        .replace(
          "import { macroCondition, dependencySatisfies, importSync } from '@embroider/macros';",
          "import { getOwner as __patched_getOwner } from '@ember/owner';",
        )
        .replace(
          /let getOwner;\s*\nif \(macroCondition\(dependencySatisfies\('ember-source', '>=4\.10\.0'\)\)\) \{\s*\n\s*getOwner = importSync\('@ember\/owner'\)\.getOwner;\s*\n\} else \{\s*\n\s*getOwner = importSync\('@ember\/application'\)\.getOwner;\s*\n\}/,
          'let getOwner = __patched_getOwner;',
        );
      return { code: patched, map: null };
    },
  };
}

export default defineConfig({
  title: 'ember-google-maps',
  description: 'Documentation for ember-google-maps',
  base: '/ember-google-maps/',
  vite: {
    plugins: [patchImportSync(), vitePluginEmber()],
    optimizeDeps: {
      exclude: ['ember-provide-consume-context'],
    },
    define: {
      __DOCS_GOOGLE_MAPS_KEY__: JSON.stringify(process.env.GOOGLE_MAPS_API_KEY ?? ''),
    },
  },
  markdown: {
    config(md) {
      emberFence(md);
    },
  },
  themeConfig: {
    nav: [{ text: 'Docs', link: '/getting-started' }],
    sidebar: [
      {
        text: 'Documentation',
        items: [
          { text: 'Getting started', link: '/getting-started' },
          { text: 'Map', link: '/map' },
          { text: 'Events', link: '/events' },
          { text: 'Components', link: '/components' },
          { text: 'Canvas', link: '/canvas' },
          { text: 'Advanced markers', link: '/advanced-markers' },
          { text: 'Circles', link: '/circles' },
          { text: 'Polylines', link: '/polylines' },
          { text: 'Info windows', link: '/info-windows' },
          { text: 'Controls', link: '/controls' },
          { text: 'Overlays', link: '/overlays' },
          { text: 'Complex UI', link: '/complex-ui' },
          { text: 'Testing', link: '/testing' },
          { text: 'Advanced', link: '/advanced' },
          { text: 'Transit layers', link: '/transit-layers' },
        ],
      },
      {
        text: 'Coming Soon',
        items: [
          { text: 'Directions', link: '/directions' },
          { text: 'Clustering', link: '/clustering' },
        ],
      },
      {
        text: 'Deprecated',
        items: [
          { text: 'Markers', link: '/markers' },
        ],
      },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/acorncom/ember-google-maps' },
    ],
  },
});
