import '@lwc/synthetic-shadow';
import { createElement } from 'lwc';
import Home from 'datatools/app';

const app = createElement('custom-element', { is: Home });
// eslint-disable-next-line @lwc/lwc/no-document-query
document.querySelector('#main').appendChild(app);
