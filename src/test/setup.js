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
