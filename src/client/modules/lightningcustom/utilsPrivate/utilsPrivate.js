export { assert } from './assert';
export { ARIA, ARIA_TO_CAMEL } from './aria';
export { EventEmitter } from './eventEmitter';
export { toNorthAmericanPhoneNumber } from './phonify';
export * from './linkUtils';
export { deepCopy, arraysEqual, ArraySlice } from './utility';
export { guid } from './guid';
export { classListMutation } from './classListMutation';
export {
    normalizeBoolean,
    normalizeString,
    normalizeArray,
    normalizeAriaAttribute
} from './normalize';
export {
    keyCodes,
    runActionOnBufferedTypedCharacters,
    normalizeKeyValue,
    isShiftMetaOrControlKey
} from './keyboard';
export { raf } from './scroll';
export { isChrome, isIE11, isSafari } from './browser';
export { ContentMutation } from './contentMutation';
export { observePosition } from './observers';
export { hasOnlyAllowedVideoIframes } from './videoUtils';
export {
    parseToFormattedLinkifiedParts,
    parseToFormattedParts
} from './linkify';
import { smartSetAttribute } from './smartSetAttribute';

/**
 * @param {HTMLElement} element Element to act on
 * @param {Object} values values and attributes to set, if the value is
 *                        falsy it the attribute will be removed
 */
export function synchronizeAttrs(element, values) {
    if (!element) {
        return;
    }
    const attributes = Object.keys(values);
    attributes.forEach((attribute) => {
        smartSetAttribute(element, attribute, values[attribute]);
    });
}

/**
 * Get the actual DOM id for an element
 * @param {HTMLElement|String} el The element to get the id for (string will just be returned)
 *
 * @returns {String} The DOM id or null
 */
export function getRealDOMId(el) {
    if (el && typeof el === 'string') {
        return el;
    } else if (el) {
        return el.getAttribute('id');
    }
    return null;
}

const URL_CHECK_REGEX = /^(\/+|\.+|ftp|http(s?):\/\/)/i;

export function isAbsoluteUrl(url) {
    return URL_CHECK_REGEX.test(url);
}

/**
 * Returns the active element traversing shadow roots
 * @returns {Element} Active Element inside shadow
 */
export function getShadowActiveElement() {
    let activeElement = document.activeElement;
    while (activeElement.shadowRoot && activeElement.shadowRoot.activeElement) {
        activeElement = activeElement.shadowRoot.activeElement;
    }
    return activeElement;
}

/**
 * Returns the active elements at each shadow root level
 * @returns {Array} Active Elements  at each shadow root level
 */
export function getShadowActiveElements() {
    let activeElement = document.activeElement;
    const shadowActiveElements = [];
    while (
        activeElement &&
        activeElement.shadowRoot &&
        activeElement.shadowRoot.activeElement
    ) {
        shadowActiveElements.push(activeElement);
        activeElement = activeElement.shadowRoot.activeElement;
    }
    if (activeElement) {
        shadowActiveElements.push(activeElement);
    }
    return shadowActiveElements;
}

export function isRTL() {
    return document.dir === 'rtl';
}

export function isUndefinedOrNull(value) {
    return value === null || value === undefined;
}

export function isNotUndefinedOrNull(value) {
    return !isUndefinedOrNull(value);
}

const DEFAULT_ZINDEX_BASELINE = 9000;
/**
 * Returns the zIndex baseline from slds zIndex variable --lwc-zIndexModal.
 * @returns {Number} zIndex baseline
 */
export function getZIndexBaseline() {
    const value = (
        window.getComputedStyle(document.documentElement) ||
        document.documentElement.style
    ).getPropertyValue('--lwc-zIndexModal');

    const base = parseInt(value, 10);

    return isNaN(base) ? DEFAULT_ZINDEX_BASELINE : base;
}

export function timeout(interval) {
    return new Promise((resolve) => {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        setTimeout(resolve, interval);
    });
}

export function animationFrame() {
    return new Promise((resolve) => {
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        window.requestAnimationFrame(resolve);
    });
}

/**
 *
 * Decorates an input element to fire an "input"
 * event when the value is directly set.
 *
 * @param {HTMLElement} element The element to decorate.
 *
 */
export function decorateInputForDragon(element) {
    const valuePropertyDescriptor = getInputValuePropertyDescriptor(element);

    Object.defineProperty(element, 'value', {
        set(value) {
            valuePropertyDescriptor.set.call(this, value);
            this.dispatchEvent(new CustomEvent('input'));
        },
        get: valuePropertyDescriptor.get,
        enumerable: true,
        configurable: true
    });
}

function getInputValuePropertyDescriptor(element) {
    return Object.getOwnPropertyDescriptor(
        Object.getPrototypeOf(element),
        'value'
    );
}

export function setDecoratedDragonInputValueWithoutEvent(element, value) {
    const valuePropertyDescriptor = getInputValuePropertyDescriptor(element);
    return valuePropertyDescriptor.set.call(element, value);
}

/**
 * Escape HTML string
 * @param {String} html An html string
 * @returns {String} The escaped html string
 */
export function escapeHTML(html) {
    return html
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
