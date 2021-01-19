/**
 * Set an attribute on an element, if it's a normal element
 * it will use setAttribute, if it's an LWC component
 * it will use the public property
 *
 * @param {HTMLElement} element The element to act on
 * @param {String} attribute the attribute to set
 * @param {Any} value the value to set
 */
export function smartSetAttribute(element, attribute, value) {
    if (element.tagName.match(/^LIGHTNING/i)) {
        attribute = attribute.replace(/-\w/g, (m) => m[1].toUpperCase());
        element[attribute] = value ? value : null;
    } else if (value) {
        element.setAttribute(attribute, value);
    } else {
        element.removeAttribute(attribute);
    }
}
