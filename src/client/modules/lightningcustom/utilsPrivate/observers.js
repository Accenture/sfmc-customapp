// hide panel on scroll
const POSITION_CHANGE_THRESHOLD = 5;
export function observePosition(
    target,
    threshold = POSITION_CHANGE_THRESHOLD,
    originalRect,
    callback
) {
    // retrieve current bounding client rect of target element
    const newBoundingRect = target.getBoundingClientRect();
    const newLeft = newBoundingRect.left;
    const newTop = newBoundingRect.top;

    // old bounding rect values
    const oldLeft = originalRect.left;
    const oldTop = originalRect.top;

    // if we have a position change (horizontal or vertical) equal or greater to the threshold then execute the callback
    const horizontalShiftDelta = Math.abs(newLeft - oldLeft);
    const verticalShiftDelta = Math.abs(newTop - oldTop);

    if (horizontalShiftDelta >= threshold || verticalShiftDelta >= threshold) {
        callback();
    }
}
