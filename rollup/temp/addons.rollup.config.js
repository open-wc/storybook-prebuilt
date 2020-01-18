/* eslint-disable global-require, import/no-dynamic-require, no-param-reassign  */
import deepmerge from 'deepmerge';
import alias from '@rollup/plugin-alias';
import createSharedConfig from './shared.rollup.config.js';

const coreAddons = ['a11y'];

function createAddonConfig(name) {
  const managerModulePath = require.resolve(`@storybook/addon-${name}/register`);
  // const previewModulePath = require.resolve(`@storybook/addon-${name}`);
  const managerModule = require(managerModulePath);
  // const previewModule = require(previewModulePath);

  const sharedManagerConfig = createSharedConfig({
    dir: `addons/${name}`,
    name: 'register.js',
    namedExports: { [managerModulePath]: Object.keys(managerModule) },
  });
  // const sharedPreviewConfig = createSharedConfig({
  //   dir: `addons/${name}`,
  //   name: 'index.js',
  //   namedExports: { [previewModulePath]: Object.keys(previewModule) },
  // });

  return [
    deepmerge(sharedManagerConfig, {
      external: ['./manager.js'],

      plugins: [
        {
          resolveId(id) {
            console.log(id)
          }
        },
        // alias({
        //   entries: [{ find: /^@storybook/, replacement: './manager.js' }],
        // }),
      ],
    }),

    // deepmerge(sharedPreviewConfig, {
    //   plugins: [],
    // }),
  ];
}

export default coreAddons.map(name => createAddonConfig(name)).flat();
