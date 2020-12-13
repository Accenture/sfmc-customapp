const logger = require('../utils/logger');
/** @description saves content to content builder
 * @memberof server/sfmc
 * @function
 * @param {Object} auth object from Marketing Cloud session auth token from session
 * @param {Object} payload for creating Asset
 * @return {Response}
 */
exports.postToContentBuilder = async (auth, payload) => {
    const restURL = `${auth.rest_instance_url}asset/content/assets/${
        payload.id ? payload.id : ''
    }`;
    const rawRes = await fetch(restURL, {
        method: payload.id ? 'put' : 'post',
        body: JSON.stringify(payload),
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + auth.access_token
        }
    });
    const parsedRed = await rawRes.json();
    logger.info(parsedRed);
    if (rawRes.status < 300) {
        return parsedRed;
    }
    throw new Error(parsedRed);
};
/** @description checks if file already exists with this name
 * @memberof server/sfmc
 * @function
 * @param {Object} auth object from Marketing Cloud session auth token from session
 * @param {Object} payload for creating Asset
 * @return {Response}
 */
exports.checkFileName = async (auth, name) => {
    const restURL = `${auth.rest_instance_url}asset/content/assets/query`;
    const body = {
        query: {
            property: 'name',
            simpleOperator: 'equal',
            value: name
        }
    };
    const rawRes = await fetch(restURL, {
        method: 'post',
        body: JSON.stringify(body),
        headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + auth.access_token
        }
    });
    const parsedRed = await rawRes.json();
    if (rawRes.status === 401) {
        throw new Error(parsedRed);
    } else if (rawRes.status < 300) {
        return parsedRed;
    } else {
        throw new Error(parsedRed);
    }
};
