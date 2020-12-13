//webpack requires index.js to build with HtmlWebpackPlugin
import '@lwc/synthetic-shadow';
import { createElement } from 'lwc';
import NotFound from 'common/notfound';

const app = createElement('custom-element', { is: NotFound });
// eslint-disable-next-line @lwc/lwc/no-document-query
document.querySelector('#main').appendChild(app);
