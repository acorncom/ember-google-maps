import didInsert from '../../modifiers/g-map/did-insert.js';
import { precompileTemplate } from '@ember/template-compilation';
import { setComponentTemplate } from '@ember/component';
import templateOnly from '@ember/component/template-only';

var Canvas = setComponentTemplate(precompileTemplate("<div class=\"ember-google-map\" ...attributes {{didInsert @onCanvasReady}}>\n  {{yield}}\n</div>", {
  strictMode: true,
  scope: () => ({
    didInsert
  })
}), templateOnly());

export { Canvas as default };
//# sourceMappingURL=canvas.js.map
