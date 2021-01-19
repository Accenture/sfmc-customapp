import '@lwc/synthetic-shadow';
import { createElement } from 'lwc';
import lwcapp from 'platformevent/app';
const app = createElement('custom-element', { is: lwcapp });
// eslint-disable-next-line @lwc/lwc/no-document-query
document.querySelector('#main').appendChild(app);
