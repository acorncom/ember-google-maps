export default {
  extends: 'recommended',
  checkHbsTemplateLiterals: false,
  rules: {
    // Leaf map components (circle, shapes, layers) render nothing but yield a
    // block so consumers can nest content — a deliberate, v1-parity pattern, not
    // an accidental yield-only template.
    'no-yield-only': false,
  },
};
