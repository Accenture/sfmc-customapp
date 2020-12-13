export const isIE11 = isIE11Test(navigator);
export const isChrome = isChromeTest(navigator);
export const isSafari = isSafariTest(navigator);

// The following functions are for tests only
export function isIE11Test(navigator) {
    // https://stackoverflow.com/questions/17447373/how-can-i-target-only-internet-explorer-11-with-javascript
    return /Trident.*rv[ :]*11\./.test(navigator.userAgent);
}

export function isChromeTest(navigator) {
    // https://stackoverflow.com/questions/4565112/javascript-how-to-find-out-if-the-user-browser-is-chrome
    return (
        /Chrome/.test(navigator.userAgent) &&
        /Google Inc/.test(navigator.vendor)
    );
}

export function isSafariTest(navigator) {
    // via https://stackoverflow.com/questions/49872111/detect-safari-and-stop-script
    return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}
