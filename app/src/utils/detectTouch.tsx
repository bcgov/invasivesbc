export function detectTouchDevice() {
  const toMatch = [/Android/i, /webOS/i, /iPhone/i, /iPad/i];

  return toMatch.some((toMatchItem) => {
    return navigator.userAgent.match(toMatchItem);
  });
}
