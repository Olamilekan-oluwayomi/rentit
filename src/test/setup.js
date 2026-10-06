import "@testing-library/jest-dom/vitest";

// Polyfill IntersectionObserver for framer-motion (used in jsdom)
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return [] }
}
global.IntersectionObserver.prototype.constructor = global.IntersectionObserver

// Polyfill matchMedia for jsdom, which does not implement it. ThemeContext
// (prefers-color-scheme) and ScrollToTop (prefers-reduced-motion) both call it,
// so any suite rendering them needs this. Defaults to no match.
if (typeof window !== "undefined" && !window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener() {},
    removeEventListener() {},
    addListener() {},
    removeListener() {},
    dispatchEvent() { return false },
  })
}
