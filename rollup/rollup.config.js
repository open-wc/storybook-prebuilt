/* eslint-disable global-require, import/no-dynamic-require, no-param-reassign  */
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import inject from '@rollup/plugin-inject';
import { terser } from 'rollup-plugin-terser';
import builtins from 'rollup-plugin-node-builtins';
import nodeGlobals from 'rollup-plugin-node-globals';
import commonjs from '@rollup/plugin-commonjs';
import babel from 'rollup-plugin-babel';
import replaceModules from './plugins/replace-modules.js';
import filterModules from './plugins/filter-modules.js';
import virtualModules from './plugins/virtual-modules.js';

export default {
  input: {
    react: './src/react.js',
    'react-dom': './src/react-dom.js',

    manager: './src/manager.js',
    'web-components': './src/web-components.js',
    addons: './src/addons.js',
    api: './src/api.js',
    'core-events': './src/core-events.js',
    theming: './src/theming.js',
    'theming/create': './src/theming/create.js',

    'addon-actions': './src/addon-actions.js',
    'addon-actions/register': './src/addon-actions/register.js',

    'addon-knobs': './src/addon-knobs.js',
    'addon-knobs/register': './src/addon-knobs/register.js',

    'addon-a11y': './src/addon-a11y.js',
    'addon-a11y/register': './src/addon-a11y/register.js',

    'addon-docs/register': './src/addon-docs/register.js',
    'addon-docs/blocks': './src/addon-docs/blocks.js',

    'addon-links': './src/addon-links.js',
    'addon-links/register': './src/addon-links/register.js',

    // only register
    'addon-backgrounds/register': './src/addon-backgrounds/register.js',
    'addon-viewport/register': './src/addon-viewport/register.js',

    'addon-web-components-knobs': 'storybook-addon-web-components-knobs',
  },
  output: {
    dir: '.',
    format: 'esm',
    sourcemap: true,
    chunkFileNames: 'dist/storybook-prebuilt-[hash].js',
  },

  // make sure lit-html is imported at runtime and not bundled
  external: ['lit-html'],

  plugins: [
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

    // OPTIMIZATION: filter out core-js polyfills to reduce bundle size
    filterModules(['node_modules/core-js']),

    // allow loading json files as modules
    json(),

    // allow loading commonjs modules
    commonjs({
      // rollup cannot always detect dynamic exports from commonjs modules, these are
      // set as namedExports. possibly obsolete when https://github.com/rollup/rollup/pull/3295 is applied to commonjs
      namedExports: {
        // detect react exports dynamically by importing them in nodejs and
        // registering the exported keys... it's magic :)
        ...['react', 'react-dom', 'prop-types', 'react-is'].reduce((all, module) => {
          const key = require.resolve(module);
          all[key] = [...Object.keys(require(key))];
          return all;
        }, {}),

        // manual named export
        '@storybook/web-components': [
          'setAddon',
          'addDecorator',
          'addParameters',
          'configure',
          'getStorybook',
          'forceReRender',
          'raw',
          'getCustomElements',
          'setCustomElements',
          'isValidComponent',
          'isValidMetaData',
        ],

        '@storybook/addons': [
          'makeDecorator',
          'addons',
          'AddonStore',
          'mockChannel',
          'HooksContext',
          'useParameter',
          'useStoryContext',
          'useChannel',
          'useEffect',
          'useReducer',
          'useState',
          'useStateLike',
          'triggerUpdate',
          'useRef',
          'useRefLike',
          'useCallback',
          'useMemo',
        ],

        '@storybook/api': ['StoreOptions', 'ChannelListener'],

        '@storybook/addon-docs/blocks': [
          'ColorPalette',
          'ColorItem',
          'IconGallery',
          'IconItem',
          'Typeset',
          'Anchor',
          'Description',
          'DocsContext',
          'DocsPage',
          'DocsContainer',
          'DocsStory',
          'Heading',
          'Meta',
          'Preview',
          'Primary',
          'Props',
          'Source',
          'Stories',
          'Story',
          'Subheading',
          'Subtitle',
          'Title',
          'Wrapper',
          'assertIsFn',
          'AddContext',
          'CodeOrSourceMdx',
          'AnchorMdx',
          'HeaderMdx',
          'HeadersMdx',
        ],

        '@storybook/theming': [
          'themes',
          'createGlobal',
          'createReset',
          'color',
          'background',
          'typography',
          'create',
          'convert',
          'ensure',
          'lighten',
          'darken',
        ],

        '@storybook/theming/create': ['create'],

        '@storybook/addon-knobs': ['boolean'],

        '@storybook/addon-actions': [
          'actions',
          'action',
          'decorate',
          'decorateAction',
          'configureActions',
          'withActions',
        ],

        '@storybook/addon-links': ['linkTo', 'hrefTo', 'withLinks'],
      },
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

    // the majority of the storybook ecosystem is es5, but some are not. we compile all to es5, so that we can skip
    // compiling it by users. when storybook dependencies start becoming non-es5, we can consider making a separate
    // non-es5 build
    babel.generated({
      presets: [
        [
          '@babel/env',
          {
            targets: ['ie 11'],
            useBuiltIns: false,
            modules: false,
          },
        ],
      ],
    }),

    // minify final output
    terser(),
  ],
};
