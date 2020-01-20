import { addParameters, addDecorator, setCustomElements, configure } from '../web-components.js';
import { withA11y } from '../addon-a11y.js';
import * as DemoWcCard from './stories/demo-wc-card.stories.js';

async function run() {
  const customElements = await (
    await fetch(new URL('./custom-elements.json', import.meta.url))
  ).json();
  setCustomElements(customElements);

  addDecorator(withA11y);

  addParameters({
    a11y: {
      config: {},
      options: {
        checks: { 'color-contrast': { options: { noScroll: true } } },
        restoreScroll: true,
      },
    },
    options: {
      hierarchyRootSeparator: /\|/,
    },
    docs: {
      iframeHeight: '200px',
    },
  });

  configure(() => [DemoWcCard], {});
}

run();
