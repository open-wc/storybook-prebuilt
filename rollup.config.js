import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'dist/preview-cjs.js',
  output: {
    file: 'dist/preview.js',
    format: 'esm',
  },
  plugins: [
    commonjs({
      namedExports: {
        'dist/preview-cjs.js': [
          'React',
          'makeStoryFn',
          'storiesOf',
          'addParameters',
          'addDecorator',
          'configure',
          // addons
          'withA11y',
          'action',
          'linkTo',
          // knobs addon
          'withKnobs',
          'text',
          'button',
          'number',
          'select',
          'date',
          'object',
          'color',
          'array',
          'boolean',
          'radios',
          'files',
          'optionsKnob',
          'withWebComponentsKnobs',
          // Docs Mode
          'mdx',
          'DocsContainer',
          'DocsPage',
          'Story',
          'Preview',
          'Meta',
          'Props',
          // web components
          'html',
          'setCustomElements',
          'getCustomElements',
          'isValidComponent',
          'isValidMetaData'
        ],
      },
    }),
    {
      renderChunk(code, id) {
        return code.replace(
          "import litHtml from 'lit-html';",
          "import * as litHtml from 'lit-html';",
        );
      },
    },
    terser(),
  ],
};
