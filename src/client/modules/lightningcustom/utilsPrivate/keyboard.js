export const keyCodes = {
    tab: 9,
    backspace: 8,
    enter: 13,
    escape: 27,
    space: 32,
    pageup: 33,
    pagedown: 34,
    end: 35,
    home: 36,
    left: 37,
    up: 38,
    right: 39,
    down: 40,
    delete: 46,
    shift: 16
};

// Acceptable values are defined here: https://developer.mozilla.org/en-US/docs/Web/KeyboardEvent/key/Key_Values
// remove this function when IE11 support is dropped
export function normalizeKeyValue(value) {
    switch (value) {
        case 'Spacebar':
            return ' ';
        case 'Esc':
            return 'Escape';
        case 'Del':
            return 'Delete';
        case 'Left':
            return 'ArrowLeft';
        case 'Right':
            return 'ArrowRight';
        case 'Down':
            return 'ArrowDown';
        case 'Up':
            return 'ArrowUp';
        default:
            return value;
    }
}

const buffer = {};

export function isShiftMetaOrControlKey(event) {
    return event.shiftKey || event.metaKey || event.ctrlKey;
}

/**
 * Runs an action and passes the string of buffered keys typed within a short time period.
 * Use for type-ahead like functionality in menus, lists, comboboxes, and similar components.
 *
 * @param {CustomEvent} event A keyboard event
 * @param {Function} action function to run, it's passed the buffered text
 */
export function runActionOnBufferedTypedCharacters(event, action) {
    const letter = event.key;

    if (letter && letter.length > 1) {
        // Not an individual character/letter, but rather a special code (like Shift, Backspace, etc.)
        return;
    }

    // If we were going to clear what keys were typed, don't yet.
    if (buffer._clearBufferId) {
        clearTimeout(buffer._clearBufferId);
    }

    buffer._keyBuffer = buffer._keyBuffer || [];
    buffer._keyBuffer.push(letter);

    const matchText = buffer._keyBuffer.join('').toLowerCase();

    action(matchText);

    // eslint-disable-next-line @lwc/lwc/no-async-operation
    buffer._clearBufferId = setTimeout(() => {
        buffer._keyBuffer = [];
    }, 700);
}
