/* eslint-disable global-require, import/no-dynamic-require, no-param-reassign  */
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import replace from '@rollup/plugin-replace';
import inject from '@rollup/plugin-inject';
import { terser } from 'rollup-plugin-terser';
import builtins from 'rollup-plugin-node-builtins';
import nodeGlobals from 'rollup-plugin-node-globals';
import replaceModules from './plugins/replace-modules.js';
import filterModules from './plugins/filter-modules.js';
import virtualModules from './plugins/virtual-modules.js';

export default ({ dir, name, namedExports }) => ({
  input: `src/${dir}/${name}.js`,
  output: {
    file: `dist/${dir}/${name}.js`,
    format: 'esm',
    sourcemap: true,
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
      // set as namedExports
      namedExports,
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
      '____environment____': "export default 'production'",
   }),

    // polyfill nodejs globals such as `global` and `process`
    nodeGlobals(),

    // polyfill nodejs modules, such as `require('util')`
    builtins(),

    // resolve bare module imports
    resolve({
      preferBuiltins: false,
    }),

    // minify final output
    // terser(),
  ],
});
