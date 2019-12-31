import commonjs from 'rollup-plugin-commonjs';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'dist/preview-cjs.js',
  output: {
    file: 'dist/preview.js',
    format: 'esm',
    sourcemap: true,
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
          'AddContext',
          'Anchor',
          'Description',
          'DocsContainer',
          'DocsPage',
          'Heading',
          'Meta',
          'Story',
          'Preview',
          'mdx',
          'Props',
          // web components
          'html',
          'setCustomElements',
          'getCustomElements',
          'isValidComponent',
          'isValidMetaData',
          // unknown
          'assertIsFn',
        ],
      },
    }),
    {
      renderChunk(code) {
        return {
          code: code.replace(
            "import litHtml from 'lit-html';",
            "import * as litHtml from 'lit-html';",
          ),
          map: null,
        };
      },
    },
    terser(),
  ],
};
