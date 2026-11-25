// Native math is available immediately, including before the CDN responds.
export function nativeFormula(markup: string, label: string): Element {
  const math = new DOMParser().parseFromString(
    `<math xmlns="http://www.w3.org/1998/Math/MathML" display="block">${markup}</math>`,
    'application/xml',
  ).documentElement;
  math.setAttribute('aria-label', label);
  return document.importNode(math, true);
}
