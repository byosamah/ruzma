import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Check if we're in a DOM environment (jsdom or browser)
const hasDOM = typeof window !== 'undefined';
const isBrowser = hasDOM && typeof IntersectionObserver !== 'undefined';

// Only mock browser APIs in jsdom environment (not in browser mode or node)
if (hasDOM && !isBrowser) {
  // Mock IntersectionObserver
  globalThis.IntersectionObserver = class IntersectionObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  } as any;

  // Mock ResizeObserver
  globalThis.ResizeObserver = class ResizeObserver {
    constructor() {}
    disconnect() {}
    observe() {}
    unobserve() {}
  } as any;

  // Mock scrollTo
  globalThis.scrollTo = vi.fn();
}

// Mock matchMedia only if window exists
if (hasDOM && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation(query => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

// Mock localStorage only in jsdom (browser mode has real localStorage, node has none)
if (hasDOM && !isBrowser && !globalThis.localStorage) {
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  globalThis.localStorage = localStorageMock as any;
}