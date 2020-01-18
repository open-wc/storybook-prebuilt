/* eslint-disable global-require, import/no-dynamic-require, no-param-reassign  */
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import inject from '@rollup/plugin-inject';
import { terser } from 'rollup-plugin-terser';
import builtins from 'rollup-plugin-node-builtins';
import nodeGlobals from 'rollup-plugin-node-globals';
import commonjs from './plugins/rollup-plugin-commonjs-fork.js';
import replaceModules from './plugins/replace-modules.js';
import filterModules from './plugins/filter-modules.js';
import virtualModules from './plugins/virtual-modules.js';
// import syntheticNamedExports from './plugins/synthetic-named-exports.js';

export default {
  input: {
    manager: './src/manager.js',
    // 'web-components': '@storybook/web-components',

    // 'addon-actions': '@storybook/addon-actions',
    // 'addon-actions/register': '@storybook/addon-actions/register',

    // 'addon-knobs': '@storybook/addon-knobs',
    // 'addon-knobs/register': '@storybook/addon-knobs/register',

    // 'addon-a11y': '@storybook/addon-a11y',
    // 'addon-a11y/register': '@storybook/addon-a11y/register',

    // 'addon-docs/register': '@storybook/addon-docs/register',
    // 'addon-docs/blocks': '@storybook/addon-docs/blocks',

    // 'addon-backgrounds': '@storybook/addon-backgrounds',
    // 'addon-backgrounds/register': '@storybook/addon-backgrounds/register',

    // 'addon-links': '@storybook/addon-links',
    // 'addon-links/register': '@storybook/addon-links/register',

    // 'addon-viewport': '@storybook/addon-viewport',
    // 'addon-viewport/register': '@storybook/addon-viewport/register',

    // 'addon-web-components-knobs': 'storybook-addon-web-components-knobs',
  },
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: true,
    chunkFileNames: 'storybook-prebuilt-[hash].js',
  },

  // make sure lit-html is imported at runtime and not bundled
  external: ['lit-html'],

  plugins: [
    // syntheticNamedExports([
    //   'react',
    //   'react-dom',
    //   'react-is',
    //   'prop-types',
    //   'global',
    //   '@storybook/web-components',
    //   '@storybook/addon-actions',
    //   '@storybook/addon-knobs',
    //   '@storybook/addon-a11y',
    //   '@storybook/addon-docs',
    //   '@storybook/addon-backgrounds',
    //   '@storybook/addon-links',
    //   '@storybook/addon-viewport',
    //   'storybook-addon-web-components-knobs',
    // ]),
    // rollup-plugin-node-builtins accesses process from global.process, which doesn't exist
    replace({
      include: [require.resolve('rollup-plugin-node-builtins/src/es6/util.js')],
      values: {
        'global.process': 'process',
      },
    }),

    // storybook addon actions has circular dependencies, which break when converted to esm
    // possibly obsolete when https://github.com/rollup/rollup/pull/3295 is applied to commonjs
    {
      transform(code, id) {
        if (
          id === require.resolve('@storybook/addon-actions/dist/containers/ActionLogger/index.js')
        ) {
          return code.replace('var _ = require("../..");', 'var _ = require("../../constants");');
        }
        return null;
      },
    },

    // monkey patch some modules
    replaceModules({
      // core-js parse-int and parse-float trip up the rollup [arser for some reason
      'core-js/internals/parse-int.js': 'export default parseInt',
      'core-js/internals/parse-float.js': 'export default parseFloat',
    }),

    // OPTIMIZATION: filter out core-js polyfills to reduce bundle size
    filterModules(['node_modules/core-js']),

    // allow loading json files as modules
    json(),

    // allow loading commonjs modules
    commonjs({
      // rollup cannot always detect dynamic exports from commonjs modules, these are
      // set as namedExports. possibly obsolete when https://github.com/rollup/rollup/pull/3295 is applied to commonjs
      // namedExports: {
      //   // detect react exports dynamically by importing them in nodejs and
      //   // registering the exported keys... it's magic :)
      //   ...['react', 'react-dom', 'prop-types', 'react-is'].reduce((all, module) => {
      //     const key = require.resolve(module);
      //     all[key] = [...Object.keys(require(key))];
      //     return all;
      //   }, {}),

      //   // manual named export
      //   [require.resolve('@storybook/web-components')]: [
      //     'storiesOf',
      //     'addParameters',
      //     'addDecorator',
      //     'setCustomElements',
      //     'getCustomElements',
      //     'isValidComponent',
      //     'isValidMetaData',
      //     'configure',
      //   ],

      //   [require.resolve('@storybook/addon-actions')]: ['action', '__moduleExports'],

      //   [require.resolve('@storybook/addon-knobs')]: ['boolean'],

      //   [require.resolve('@storybook/addon-links')]: ['linkTo'],

      //   [require.resolve('global')]: ['window'],
      // },
    }),

    // A lot of modules check process.env.NODE_ENV for handling environment
    // specific code. We handle this in an efficent way in 3 steps:
    // 1) first the code them with a unique variable, so that it doesn't get
    // picked up by other plugins
    replace({
      values: {
        'process.env.NODE_ENV': '____environment____',
      },
    }),
    // 2) then replace the variable with a unique import, this allows rollup
    // to tree shake dead code
    inject({
      ____environment____: '____environment____',
    }),
    // 3) provide the content for the ____environment____ module
    virtualModules({
      ____environment____: "export default 'production'",
    }),

    // polyfill nodejs globals such as `global` and `process`
    nodeGlobals(),

    // polyfill nodejs modules, such as `require('util')`
    builtins(),

    // resolve bare module imports
    resolve({
      preferBuiltins: false,
    }),

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
          code: code.replace('import litHtml', 'import * as litHtml'),
          map: null,
        };
      },
    },

    // minify final output
    // terser(),
  ],
};
