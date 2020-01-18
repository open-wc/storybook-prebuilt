/* eslint-disable global-require, import/no-dynamic-require, no-param-reassign  */
import resolve from '@rollup/plugin-node-resolve';
import json from '@rollup/plugin-json';
import commonjs from './plugins/rollup-plugin-commonjs-fork.js';

export default {
  input: {
    test: './rollup/test/input.js',
  },
  output: {
    dir: 'dist',
    format: 'esm',
    sourcemap: true,
    // chunkFileNames: 'storybook-prebuilt-[hash].js',
  },
  plugins: [
    // allow loading commonjs modules
    commonjs({ }),
    resolve(),
    json(),
  ],
};
