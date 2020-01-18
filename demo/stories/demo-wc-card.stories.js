import { html } from 'lit-html';

import '../demo-wc-card.js';

export default {
  title: 'Components|Card',
  component: 'demo-wc-card',
};

export const heading = () =>
  html`
    <h1>Hello World</h1>
    <input type="text" />
  `;

export const card = () =>
  html`
    <demo-wc-card>Hello World</demo-wc-card>
  `;
