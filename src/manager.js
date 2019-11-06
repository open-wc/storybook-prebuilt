// load the storybook manager UI
import '@storybook/core/dist/client/manager/index.js';

// order of tabs in addons panel
import '@storybook/addon-actions/register';
import '@storybook/addon-storysource/register';
import '@storybook/addon-knobs/register';
import '@storybook/addon-a11y/register';
import '@storybook/addon-docs/register';

// no tab in addons panel (e.g. load order does not matter here)
import '@storybook/addon-backgrounds/register';
import '@storybook/addon-links/register';
import '@storybook/addon-viewport/register';
