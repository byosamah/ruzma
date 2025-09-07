# Testing Guide

## 🎯 Testing Philosophy

Our testing strategy focuses on **user-centric testing** that validates real user interactions and accessibility compliance while maintaining high performance and zero breaking changes.

## 🛠️ Testing Stack

- **Test Runner**: Vitest 3.2+ (Fast, Vite-native testing)
- **Testing Library**: React Testing Library (User-focused testing)
- **User Interactions**: @testing-library/user-event (Real user simulation)
- **Mocking**: Vitest built-in mocks
- **Coverage**: Vitest coverage (v8 provider)

## 🚀 Quick Start

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run tests once and exit
npm run test:run
```

## 🧪 Testing Patterns

### Component Testing Pattern
```typescript
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { vi } from 'vitest';
import { MyComponent } from '../MyComponent';

describe('MyComponent', () => {
  it('handles user interactions correctly', async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    
    render(<MyComponent onClick={handleClick} />);
    
    await user.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Accessibility Testing Pattern
```typescript
it('meets accessibility standards', () => {
  render(<AccessibleComponent />);
  
  // Test semantic structure
  expect(screen.getByRole('button')).toBeInTheDocument();
  
  // Test ARIA labels
  expect(screen.getByLabelText('Close dialog')).toBeInTheDocument();
  
  // Test keyboard navigation
  const button = screen.getByRole('button');
  button.focus();
  expect(button).toHaveFocus();
});
```

### Responsive Design Testing Pattern
```typescript
it('adapts to different screen sizes', () => {
  render(<ResponsiveComponent />);
  
  const element = screen.getByTestId('responsive-element');
  
  // Test mobile classes
  expect(element).toHaveClass('p-4', 'md:p-6');
  
  // Test touch target size
  expect(element).toHaveClass('min-h-[44px]');
});
```

## 📋 Testing Checklist

### ✅ Component Tests Must Include:
- [ ] **User Interactions** - Click, keyboard, form submission
- [ ] **Accessibility** - ARIA labels, focus management, screen readers
- [ ] **Responsive Design** - Mobile-first classes, touch targets
- [ ] **Error States** - Loading, error, empty states
- [ ] **Props Validation** - Required/optional props, type checking
- [ ] **Visual Regression** - Consistent styling and layout

### ✅ Integration Tests Should Cover:
- [ ] **User Journeys** - Complete workflows (login → dashboard → action)
- [ ] **API Interactions** - Success/error responses, loading states
- [ ] **Route Navigation** - Protected routes, redirects, 404s
- [ ] **State Management** - Context updates, localStorage sync

### ✅ Accessibility Test Requirements:
- [ ] **Semantic HTML** - Proper heading hierarchy, landmarks
- [ ] **Keyboard Navigation** - Tab order, Enter/Space activation
- [ ] **Screen Reader Support** - ARIA labels, live regions
- [ ] **Focus Management** - Visual indicators, trap handling
- [ ] **Color Contrast** - WCAG AA compliance minimum

## 🎨 UI Testing Standards

### Hover Effects Removal Validation
```typescript
it('maintains functionality without hover effects', () => {
  render(<InteractiveCard />);
  
  const card = screen.getByRole('article');
  
  // Should not have hover classes
  expect(card).not.toHaveClass('hover:shadow-md');
  
  // Should maintain interaction via click/tap
  fireEvent.click(card);
  expect(mockHandler).toHaveBeenCalled();
});
```

### Focus Ring Testing
```typescript
it('shows focus indicators for keyboard users', () => {
  render(<FocusableElement />);
  
  const element = screen.getByRole('button');
  element.focus();
  
  // Should have focus-visible utilities
  expect(element).toHaveClass('focus-visible:outline-none');
  expect(element).toHaveClass('focus-visible:ring-2');
});
```

### Mobile-First Testing
```typescript
it('prioritizes mobile user experience', () => {
  render(<MobileComponent />);
  
  const touchTarget = screen.getByRole('button');
  
  // Minimum 44px touch target
  expect(touchTarget).toHaveClass('min-h-[44px]');
  
  // Touch-friendly interactions
  expect(touchTarget).toHaveClass('touch-manipulation');
});
```

## 🔧 Test Configuration

### Vitest Setup (`vite.config.ts`)
```typescript
test: {
  globals: true,
  environment: 'jsdom',
  setupFiles: ['./src/test/setup.ts'],
  css: true,
}
```

### Test Setup (`src/test/setup.ts`)
```typescript
import '@testing-library/jest-dom';

// Mock browser APIs
global.IntersectionObserver = class IntersectionObserver {
  // Implementation
};

global.ResizeObserver = class ResizeObserver {
  // Implementation
};
```

## 📊 Coverage Goals

- **Statements**: 80%+ (Critical paths: 95%+)
- **Branches**: 75%+ (Error handling: 90%+) 
- **Functions**: 85%+ (Public APIs: 100%)
- **Lines**: 80%+ (Business logic: 95%+)

### Priority Coverage Areas:
1. **User Authentication** - 100% coverage required
2. **Data Operations** - 95% coverage (CRUD operations)
3. **Form Validation** - 90% coverage (Input validation)
4. **Navigation** - 85% coverage (Route protection)
5. **UI Components** - 80% coverage (Interaction patterns)

## 🚨 Critical Test Categories

### Security Testing
```typescript
it('prevents XSS attacks in user content', () => {
  render(<UserContent content="<script>alert('xss')</script>" />);
  
  // Should escape dangerous content
  expect(screen.queryByRole('script')).not.toBeInTheDocument();
  expect(screen.getByText(/script/)).toBeInTheDocument();
});
```

### Performance Testing
```typescript
it('renders within performance budget', async () => {
  const startTime = performance.now();
  render(<LargeComponent items={mockItems} />);
  const endTime = performance.now();
  
  expect(endTime - startTime).toBeLessThan(16); // 60fps budget
});
```

### Error Boundary Testing
```typescript
it('handles component errors gracefully', () => {
  const ThrowError = () => { throw new Error('Test error'); };
  
  render(
    <ErrorBoundary>
      <ThrowError />
    </ErrorBoundary>
  );
  
  expect(screen.getByText(/something went wrong/i)).toBeInTheDocument();
});
```

## 🎯 Best Practices

### DO ✅
- **Test user behavior, not implementation details**
- **Use semantic queries (getByRole, getByLabelText)**
- **Test error states and edge cases**
- **Validate accessibility compliance**
- **Mock external dependencies**
- **Use realistic test data**

### DON'T ❌
- **Test internal component state directly**
- **Use fragile CSS selectors**
- **Skip async operation testing**
- **Ignore accessibility in tests**
- **Test every trivial prop**
- **Mock everything unnecessarily**

## 🚀 Advanced Testing

### Visual Regression Testing
```bash
# Future: Add Chromatic or Percy
npm run test:visual
```

### E2E Testing Setup
```bash
# Future: Add Playwright
npm run test:e2e
```

### Performance Testing
```bash
# Future: Add Lighthouse CI
npm run test:performance
```

## 📈 Test Metrics Dashboard

Our testing setup provides:
- **Real-time coverage reports**
- **Performance benchmarks**
- **Accessibility compliance scores**
- **Mobile responsiveness validation**
- **Security vulnerability detection**

## 🎓 Learning Resources

- [Testing Library Documentation](https://testing-library.com/)
- [Vitest Guide](https://vitest.dev/)
- [Web Accessibility Testing](https://web.dev/accessibility/)
- [Mobile Testing Best Practices](https://web.dev/mobile/)

---

**Remember**: Good tests give confidence in refactoring and ensure user experience quality. Test what matters to your users!