/**
 * Create a deep copy of an object or array
 * @param {object|array} obj - item to be copied
 * @returns {object|array} copy of the item
 */
export function deepCopy(obj) {
    if (Object(obj) !== obj) {
        // primitives
        return obj;
    }
    if (obj instanceof Set) {
        return new Set(obj);
    }
    if (obj instanceof Date) {
        return new Date(obj);
    }
    if (typeof obj === 'function') {
        return obj.bind({});
    }
    if (Array.isArray(obj)) {
        const obj2 = [];
        const len = obj.length;
        for (let i = 0; i < len; i++) {
            obj2.push(deepCopy(obj[i]));
        }
        return obj2;
    }
    const result = Object.create({});
    let keys = Object.keys(obj);
    if (obj instanceof Error) {
        // Error properties are non-enumerable
        keys = Object.getOwnPropertyNames(obj);
    }

    const len = keys.length;
    for (let i = 0; i < len; i++) {
        const key = keys[i];
        result[key] = deepCopy(obj[key]);
    }
    return result;
}

/**
 * Compare two arrays and return true if they are equal
 * @param {array} array1 - first array to compare
 * @param {array} array2 - second array to compare
 * @returns {boolean} if the arrays are identical
 */
export function arraysEqual(array1, array2) {
    // if either array is falsey, return false
    if (!array1 || !array2) {
        return false;
    }

    // if array lengths don't match, return false
    if (array1.length !== array2.length) {
        return false;
    }

    for (let index = 0; index < array1.length; index++) {
        // Check if we have nested arrays
        if (array1[index] instanceof Array && array2[index] instanceof Array) {
            // recurse into the nested arrays
            if (!arraysEqual(array1[index], array2[index])) {
                return false;
            }
        } else if (array1[index] !== array2[index]) {
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;
        }
    }

    return true;
}

export const ArraySlice = Array.prototype.slice;
