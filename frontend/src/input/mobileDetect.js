/**
 * Detect if the device is a mobile/touch device.
 * Uses coarse pointer media query with touch event fallback.
 */
export function isMobile() {
  return window.matchMedia('(pointer: coarse)').matches
    || ('ontouchstart' in window)
    || navigator.maxTouchPoints > 0;
}
