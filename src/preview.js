import React from 'react';
import '@storybook/addon-console';

import '@storybook/addon-docs/dist/frameworks/common/config.js';
import '@storybook/addon-docs/dist/frameworks/web-components/config.js';

export * from '@storybook/addon-docs/blocks';
export { withA11y } from '@storybook/addon-a11y';
export { mdx } from '@mdx-js/react';
export { React };

export { html } from 'lit-html';

export {
  storiesOf,
  addParameters,
  addDecorator,
  setCustomElements,
  getCustomElements,
  isValidComponent,
  isValidMetaData,
  configure,
} from '@storybook/web-components';
export { action } from '@storybook/addon-actions';
export { linkTo } from '@storybook/addon-links';
export { document } from 'global';
export {
  withKnobs,
  text,
  button,
  number,
  select,
  date,
  object,
  color,
  array,
  boolean,
  radios,
  files,
  optionsKnob,
} from '@storybook/addon-knobs';

export { withWebComponentsKnobs } from 'storybook-addon-web-components-knobs';
