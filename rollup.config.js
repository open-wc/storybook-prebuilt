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
          'html',
          'storiesOf',
          'addParameters',
          'addDecorator',
          'configure',
          'withA11y',
          'setCustomElements',
          'Story',
          'Preview',
          'Meta',
          'Props',
          'action',
          'withKnobs',
          'text',
          'number',
          'withWebComponentsKnobs',
          'React',
          'mdx',
          'DocsContainer',
          'makeStoryFn',
          'getCustomElements',
          'isValidComponent',
          'isValidMetaData',
          'DocsPage',
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
