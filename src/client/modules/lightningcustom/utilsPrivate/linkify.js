import {
    urlRegexString,
    newLineRegexString,
    emailRegexString,
    createHttpHref,
    createEmailHref
} from './linkUtils';

/*
 * Regex was taken from aura lib and refactored
 */
const linkRegex = new RegExp(
    `(${newLineRegexString})|${urlRegexString}|${emailRegexString}`,
    'gi'
);
const linkRegexNoNewLine = new RegExp(
    `${urlRegexString}|${emailRegexString}`,
    'gi'
);
const emailRegex = new RegExp(emailRegexString, 'gi');
const newLineRegex = new RegExp(newLineRegexString, 'gi');

function getTextPart(text) {
    return {
        isText: true,
        value: text
    };
}

function getUrlPart(url, index) {
    return {
        isLink: true,
        value: url,
        href: createHttpHref(url),
        key: `${url}-${index}`
    };
}

function getEmailPart(email, index) {
    return {
        isLink: true,
        value: email,
        href: createEmailHref(email),
        key: `${email}-${index}`
    };
}

function getNewlinePart(index) {
    return {
        isNewline: true,
        key: index
    };
}

function getLinkPart(link, index, ignoreNewLines) {
    if (!ignoreNewLines && link.match(newLineRegex)) {
        return getNewlinePart(index);
    } else if (link.match(emailRegex)) {
        return getEmailPart(link, index);
    }
    return getUrlPart(link, index);
}

/**
 * Parse text into parts of text, links, emails, new lines
 * @param text {string} Text to parse into linkified parts
 * @param ignoreNewLines {boolean} Boolean indicating whether to return new line parts or not
 * if true new lines are included in text/url/email parts otherwise they are returned in their
 * own parts by default
 * @returns {[]}
 */
export function parseToFormattedLinkifiedParts(text, ignoreNewLines = false) {
    const parts = [];
    const re = ignoreNewLines ? linkRegexNoNewLine : linkRegex;
    let match;
    let index = 0;
    while ((match = re.exec(text)) !== null) {
        let link = match[0];
        const endsWithQuote = link && link.endsWith('&quot');
        // If we found an email or url match, then create a text part for everything
        // up to the match and then create the part for the email or url
        if (match.index > 0) {
            parts.push(getTextPart(text.slice(0, match.index)));
        }
        if (endsWithQuote) {
            link = link.slice(0, link.lastIndexOf('&quot'));
        }
        parts.push(getLinkPart(link, index, ignoreNewLines));

        if (endsWithQuote) {
            parts.push(getTextPart('&quot'));
        }
        text = text.substring(re.lastIndex);
        re.lastIndex = 0;
        index = index + 1;
    }
    if (text != null && text !== '') {
        parts.push(getTextPart(text));
    }
    return parts;
}

/**
 * Parse text into parts of text and new lines
 * @param text {string} Text to parse into parts
 * @returns {[]}
 */
export function parseToFormattedParts(text) {
    return text.split(newLineRegex).map((part, index) => {
        return index % 2 === 0 ? getTextPart(part) : getNewlinePart();
    });
}
