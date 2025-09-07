# Performance Guide - Ruzma

## 📊 Performance Overview

This guide covers performance monitoring, optimization strategies, and best practices for the Ruzma application.

### Current Performance Status

- **Bundle Size**: Optimized with strategic code splitting
- **Render Performance**: Sub-50ms component rendering
- **Load Time**: < 2s initial page load
- **Bundle Limits**: 600KB total, 250KB main JS, 30KB main CSS
- **Component Performance**: Monitored with automated tests

## 🚀 Quick Start

### Running Performance Tests

```bash
# Run all performance tests
npm run perf:test

# Run with detailed profiling
npm run perf:profile

# Analyze bundle sizes
npm run analyze

# Check size limits
npm run size
```

### Key Performance Metrics

| Metric | Current | Target | Limit |
|--------|---------|--------|-------|
| Main JS Bundle | ~180KB | < 200KB | 250KB |
| Main CSS Bundle | ~25KB | < 25KB | 30KB |
| Total Bundle Size | ~480KB | < 500KB | 600KB |
| Component Render Time | ~15ms | < 20ms | 50ms |
| Page Load Time | ~1.2s | < 1.5s | 2s |

## 📈 Performance Monitoring

### 1. Bundle Size Monitoring

The application uses `size-limit` to monitor bundle sizes and prevent regressions:

```json
{
  "name": "Main Bundle (JS)",
  "path": "dist/assets/index-*.js", 
  "limit": "250 KB"
}
```

**Automated Checks:**
- Main JS bundle: 250KB limit
- Main CSS bundle: 30KB limit
- Total bundle size: 600KB limit
- Individual chunks: 100KB limit (except vendor)

### 2. Component Performance Testing

Components are tested for render performance:

```typescript
// Example performance test
const result = measureRenderPerformance(() => {
  render(<Button>Test Button</Button>);
});

expect(result.renderTime).toBeLessThan(50); // 50ms limit
```

**Tested Scenarios:**
- Single component renders
- Bulk component rendering (50+ items)
- Re-render performance
- Memory leak detection

### 3. Real-Time Performance Monitoring

#### Bundle Analysis
```bash
npm run analyze
```

This generates `dist/stats.html` with:
- Bundle composition visualization
- Chunk size breakdown
- Dependency analysis
- Gzipped vs uncompressed sizes

#### Performance Testing
```bash
npm run perf:test
```

This runs:
- Component render benchmarks
- Bundle size validation
- Memory usage monitoring
- Performance regression detection

## 🛠 Optimization Strategies

### 1. Bundle Optimization

#### Code Splitting Configuration

```typescript
// vite.config.ts
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        vendor: ['react', 'react-dom', 'react-router-dom'],
        ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        supabase: ['@supabase/supabase-js'],
        charts: ['recharts'],
        utils: ['date-fns', 'clsx', 'tailwind-merge'],
        query: ['@tanstack/react-query'],
        forms: ['react-hook-form', '@hookform/resolvers', 'zod']
      }
    }
  }
}
```

**Benefits:**
- Parallel loading of chunks
- Better caching strategy
- Reduced main bundle size
- Faster incremental updates

#### Tree Shaking Optimization

```typescript
// ✅ DO - Import only what you need
import { Button } from '@/components/ui/button';

// ❌ DON'T - Import entire libraries
import * as Icons from 'lucide-react';
```

### 2. Component Performance

#### Render Optimization

```typescript
// ✅ DO - Use proper memo patterns
const MemoizedComponent = memo(({ data, onAction }: Props) => {
  return (
    <div>
      {data.map(item => 
        <ExpensiveItem key={item.id} item={item} onAction={onAction} />
      )}
    </div>
  );
});

// ✅ DO - Memoize callbacks
const handleAction = useCallback((id: string) => {
  onAction(id);
}, [onAction]);
```

#### Avoid Performance Pitfalls

```typescript
// ❌ DON'T - Create objects/functions in render
<Component 
  style={{ padding: 16 }}
  onClick={() => handleClick(id)}
/>

// ✅ DO - Use CSS classes and stable references
const style = useMemo(() => ({ padding: 16 }), []);
const handleClick = useCallback(() => handleClick(id), [id]);

<Component 
  className="p-4"
  onClick={handleClick}
/>
```

### 3. Asset Optimization

#### Image Optimization

```typescript
// ✅ DO - Use proper image formats and sizes
<img 
  src="/images/hero-400.webp"
  srcSet="/images/hero-400.webp 400w, /images/hero-800.webp 800w"
  sizes="(max-width: 400px) 400px, 800px"
  alt="Hero image"
  loading="lazy"
/>
```

#### CSS Optimization

```css
/* ✅ DO - Use CSS custom properties for performance */
.button {
  background: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

/* ✅ DO - Leverage GPU acceleration when needed */
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
}
```

## 📊 Performance Budgets

### Bundle Size Budget

```json
{
  "budgets": {
    "main-js": "250KB",
    "main-css": "30KB", 
    "vendor-js": "350KB",
    "total": "600KB"
  },
  "warnings": {
    "individual-chunk": "100KB",
    "third-party": "200KB"
  }
}
```

### Performance Budget

```json
{
  "budgets": {
    "component-render": "50ms",
    "page-load": "2s",
    "re-render": "20ms",
    "memory-growth": "5MB"
  }
}
```

## 🔍 Performance Debugging

### 1. Bundle Analysis

**Identify Large Dependencies:**
```bash
npm run analyze
```

Look for:
- Unexpectedly large chunks
- Duplicate dependencies
- Unused code in bundles
- Opportunities for code splitting

**Common Issues:**
- Date libraries (use date-fns with tree shaking)
- Icon libraries (import individual icons)
- Utility libraries (use lodash-es for tree shaking)

### 2. Component Performance Issues

**Debug Render Performance:**
```typescript
// Use React DevTools Profiler
import { Profiler } from 'react';

function onRenderCallback(id, phase, actualDuration) {
  console.log('Render:', { id, phase, actualDuration });
}

<Profiler id="MyComponent" onRender={onRenderCallback}>
  <MyComponent />
</Profiler>
```

**Common Performance Issues:**
- Unnecessary re-renders
- Large lists without virtualization
- Heavy computations in render
- Memory leaks from event listeners

### 3. Network Performance

**Optimize API Calls:**
```typescript
// ✅ DO - Use proper caching strategies
const { data, isLoading } = useQuery({
  queryKey: ['projects', userId],
  queryFn: () => projectService.getProjects(),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

**Monitor Network Requests:**
- Use React Query for intelligent caching
- Implement request deduplication
- Add proper loading states
- Handle offline scenarios

## 🚨 Performance Alerts

### Automated Monitoring

**CI/CD Integration:**
```yaml
# GitHub Actions example
- name: Performance Budget Check
  run: npm run size
  
- name: Performance Tests
  run: npm run perf:test
```

**Bundle Size Alerts:**
- Fails build if limits exceeded
- Warning at 90% of limit
- Tracks size changes over time

**Performance Regression Detection:**
- Component render time tracking
- Memory usage monitoring
- Bundle size trend analysis

### Manual Monitoring

**Weekly Performance Review:**
1. Run full performance test suite
2. Review bundle analysis report
3. Check Core Web Vitals metrics
4. Analyze user performance data

**Performance Checklist:**
- [ ] Bundle sizes within limits
- [ ] Component render times < 50ms
- [ ] No memory leaks detected
- [ ] Loading states properly implemented
- [ ] Error boundaries in place

## 🎯 Performance Best Practices

### Development Workflow

1. **Before Adding Dependencies:**
   - Check bundle size impact
   - Look for lighter alternatives
   - Consider tree-shaking support

2. **Before Component Changes:**
   - Run performance tests
   - Profile render behavior
   - Check for memory leaks

3. **Before Deployment:**
   - Run full performance suite
   - Analyze bundle composition
   - Verify size budgets

### Code Review Guidelines

**Performance Review Checklist:**
- [ ] No unnecessary re-renders
- [ ] Proper memoization where needed
- [ ] CSS classes instead of inline styles
- [ ] Optimized images and assets
- [ ] Efficient data structures
- [ ] Proper error handling
- [ ] Loading states implemented

### Production Monitoring

**Key Metrics to Track:**
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)
- First Input Delay (FID)
- Time to Interactive (TTI)

**Tools Integration:**
- Web Vitals monitoring
- Bundle analyzer in CI/CD
- Performance budget alerts
- Real User Monitoring (RUM)

## 📚 Additional Resources

### Performance Testing Tools

- **Vitest**: Component performance testing
- **Size Limit**: Bundle size monitoring
- **Rollup Plugin Visualizer**: Bundle analysis
- **React DevTools Profiler**: Component profiling

### Optimization Libraries

- **React Query**: Intelligent caching
- **React.memo**: Component memoization
- **useMemo/useCallback**: Value memoization
- **React.lazy**: Code splitting

### Monitoring Services

- **Web Vitals**: Core performance metrics
- **Bundle Analyzer**: Bundle composition
- **Performance Observer**: Runtime metrics
- **Lighthouse CI**: Automated auditing

---

## 🔄 Performance Optimization Workflow

1. **Measure**: Use performance tests and monitoring
2. **Identify**: Find bottlenecks and opportunities
3. **Optimize**: Apply targeted improvements
4. **Validate**: Verify improvements with tests
5. **Monitor**: Track performance over time
6. **Iterate**: Continuous improvement cycle

Remember: "Premature optimization is the root of all evil" - focus on measuring first, then optimizing based on real data and user impact.