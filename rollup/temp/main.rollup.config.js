/* eslint-disable global-require, import/no-dynamic-require, no-param-reassign  */
import deepmerge from 'deepmerge';
import createSharedConfig from './shared.rollup.config.js';
import replaceModules from './plugins/replace-modules.js';

// The named exports for the commonjs plugin
const namedExports = {
  // detect react exports dynamically by importing them in nodejs and
  // registering the exported keys... it's magic :)
  ...['react', 'react-dom', 'prop-types'].reduce((all, module) => {
    all[require.resolve(module)] = Object.keys(require(module));
    return all;
  }, {}),

  // manual named export
  [require.resolve('@storybook/web-components')]: [
    'storiesOf',
    'addParameters',
    'addDecorator',
    'setCustomElements',
    'getCustomElements',
    'isValidComponent',
    'isValidMetaData',
    'configure',
  ],
};

export default function createMainConfig({ name }) {
  const sharedConfig = createSharedConfig({ dir: 'main', name, namedExports });

  return deepmerge(sharedConfig, {
    plugins: [
      // monkey patch some modules
      replaceModules({
        // OPTIMIZATION: prevent loading too many syntax highlighting languages, singificantly reducing bundle size
        // See: https://github.com/storybookjs/storybook/issues/9282
        'react-syntax-highlighter/dist/esm/index.js':
          "export { default as PrismLight } from './prism-light'",
      }),

      // lit-html is imported by @storybook/web-components as a default import,
      // which is incorrect
      {
        name: 'lit-html-renamer',
        renderChunk(code) {
          return {
            code: code.replace(
              'import litHtml from"lit-html";',
              'import * as litHtml from"lit-html";',
            ),
            map: null,
          };
        },
      },
    ],
  });
}
