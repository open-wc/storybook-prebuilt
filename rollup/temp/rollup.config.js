import deepmerge from 'deepmerge';
import createMainConfig from './main.rollup.config.js';


export default [
  deepmerge(createMainConfig({ name: 'manager' }), {
    manualChunks: {
      a11y: ['@storybook/addon-a11y']
    },
  }),
  // createMainConfig({ name: 'preview' }),
];
