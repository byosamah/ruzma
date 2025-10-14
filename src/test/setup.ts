import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Check if we're in a browser environment (browser mode has these APIs natively)
const isBrowser = typeof window !== 'undefined' && typeof IntersectionObserver !== 'undefined';

// Only mock browser APIs in jsdom environment (not needed in browser mode)
if (!isBrowser) {
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

// Mock matchMedia (needed in both environments)
if (!window.matchMedia) {
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

// Mock localStorage only in jsdom (browser mode has real localStorage)
if (!isBrowser && !globalThis.localStorage) {
  const localStorageMock = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  };
  globalThis.localStorage = localStorageMock as any;
}