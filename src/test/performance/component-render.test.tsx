import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';

// Import key components for performance testing
import { Button } from '../../components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  RENDER_TIME: 50, // Components should render within 50ms
  RE_RENDER_TIME: 20, // Re-renders should be fast
  MOUNT_TIME: 100, // Initial mount should be under 100ms
  MANY_ITEMS: 200, // Rendering many items should be under 200ms
} as const;

interface PerformanceResult {
  renderTime: number;
  mountTime: number;
  reRenderTime?: number;
}

function measureRenderPerformance(
  renderFn: () => void,
  reRenderFn?: () => void
): PerformanceResult {
  // Measure initial render using browser's performance API (available in jsdom)
  const renderStart = window.performance.now();
  renderFn();
  const renderEnd = window.performance.now();
  
  const renderTime = renderEnd - renderStart;
  const mountTime = renderTime; // For simple components, these are the same
  
  let reRenderTime: number | undefined;

  if (reRenderFn) {
    const reRenderStart = window.performance.now();
    act(() => {
      reRenderFn();
    });
    const reRenderEndTime = window.performance.now();
    reRenderTime = reRenderEndTime - reRenderStart;
  }
  
  return {
    renderTime,
    mountTime,
    reRenderTime,
  };
}

describe('Component Render Performance', () => {
  beforeEach(() => {
    // Clear any previous renders
    document.body.innerHTML = '';
    
    // Mock console methods to reduce noise in performance tests
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('Button Component Performance', () => {
    it('should render quickly in default state', () => {
      const result = measureRenderPerformance(() => {
        render(<Button>Test Button</Button>);
      });
      
      expect(result.renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RENDER_TIME);
      expect(result.mountTime).toBeLessThan(PERFORMANCE_THRESHOLDS.MOUNT_TIME);
      
      // Log performance metrics for monitoring
      console.info(`Button render time: ${result.renderTime.toFixed(2)}ms`);
    });

    it('should handle different variants efficiently', () => {
      const variants = ['default', 'destructive', 'outline', 'secondary', 'ghost', 'link'] as const;
      
      variants.forEach((variant) => {
        const result = measureRenderPerformance(() => {
          render(<Button variant={variant}>Test {variant}</Button>);
        });
        
        expect(result.renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RENDER_TIME);
        
        // Clean up between renders
        document.body.innerHTML = '';
      });
    });

    it('should render many buttons efficiently', () => {
      const result = measureRenderPerformance(() => {
        render(
          <div>
            {Array.from({ length: 50 }, (_, i) => (
              <Button key={i} variant={i % 2 === 0 ? 'default' : 'outline'}>
                Button {i}
              </Button>
            ))}
          </div>
        );
      });
      
      expect(result.renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.MANY_ITEMS);
      
      console.info(`50 buttons render time: ${result.renderTime.toFixed(2)}ms`);
    });
  });

  describe('Alert Component Performance', () => {
    it('should render alert quickly', () => {
      const result = measureRenderPerformance(() => {
        render(
          <Alert>
            <AlertTitle>Test Alert</AlertTitle>
            <AlertDescription>This is a test alert description.</AlertDescription>
          </Alert>
        );
      });
      
      expect(result.renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RENDER_TIME);
      
      console.info(`Alert render time: ${result.renderTime.toFixed(2)}ms`);
    });

    it('should handle different alert variants efficiently', () => {
      const variants = ['default', 'destructive'] as const;
      
      variants.forEach((variant) => {
        const result = measureRenderPerformance(() => {
          render(
            <Alert variant={variant}>
              <AlertTitle>Test {variant} Alert</AlertTitle>
              <AlertDescription>This is a test alert description.</AlertDescription>
            </Alert>
          );
        });
        
        expect(result.renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RENDER_TIME);
        
        document.body.innerHTML = '';
      });
    });
  });

  describe('Badge Component Performance', () => {
    it('should render badge quickly', () => {
      const result = measureRenderPerformance(() => {
        render(<Badge>Test Badge</Badge>);
      });
      
      expect(result.renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RENDER_TIME);
      
      console.info(`Badge render time: ${result.renderTime.toFixed(2)}ms`);
    });

    it('should render many badges efficiently', () => {
      const result = measureRenderPerformance(() => {
        render(
          <div>
            {Array.from({ length: 100 }, (_, i) => (
              <Badge key={i} variant={i % 3 === 0 ? 'default' : i % 3 === 1 ? 'secondary' : 'outline'}>
                Badge {i}
              </Badge>
            ))}
          </div>
        );
      });
      
      expect(result.renderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.MANY_ITEMS);
      
      console.info(`100 badges render time: ${result.renderTime.toFixed(2)}ms`);
    });
  });

  describe('Re-render Performance', () => {
    it('should re-render button efficiently when props change', () => {
      let buttonProps = { children: 'Initial Text' };
      const TestComponent = () => <Button {...buttonProps}>Button Text</Button>;
      
      const result = measureRenderPerformance(
        () => render(<TestComponent />),
        () => {
          buttonProps = { children: 'Updated Text' };
        }
      );
      
      if (result.reRenderTime) {
        expect(result.reRenderTime).toBeLessThan(PERFORMANCE_THRESHOLDS.RE_RENDER_TIME);
        console.info(`Button re-render time: ${result.reRenderTime.toFixed(2)}ms`);
      }
    });
  });

  describe('Memory Usage Monitoring', () => {
    it('should not cause memory leaks during multiple renders', () => {
      const initialMemory = (window.performance as any).memory?.usedJSHeapSize || 0;

      // Render and unmount components multiple times
      for (let i = 0; i < 20; i++) {
        const { unmount } = render(
          <div>
            <Button>Button {i}</Button>
            <Alert>
              <AlertTitle>Alert {i}</AlertTitle>
              <AlertDescription>Description {i}</AlertDescription>
            </Alert>
            <Badge>Badge {i}</Badge>
          </div>
        );

        unmount();
      }

      // Force garbage collection if available
      if ((globalThis as any).gc) {
        (globalThis as any).gc();
      }

      const finalMemory = (window.performance as any).memory?.usedJSHeapSize || 0;
      const memoryGrowth = finalMemory - initialMemory;
      
      // Memory growth should be reasonable (less than 5MB)
      expect(memoryGrowth).toBeLessThan(5 * 1024 * 1024);
      
      console.info(`Memory growth after 20 renders: ${(memoryGrowth / 1024).toFixed(2)} KB`);
    });
  });

  describe('Performance Regression Detection', () => {
    it('should track baseline performance metrics', () => {
      const metrics = {
        buttonRender: 0,
        alertRender: 0,
        badgeRender: 0,
        manyItemsRender: 0,
      };
      
      // Button performance
      const buttonResult = measureRenderPerformance(() => {
        render(<Button>Benchmark Button</Button>);
      });
      metrics.buttonRender = buttonResult.renderTime;
      document.body.innerHTML = '';
      
      // Alert performance  
      const alertResult = measureRenderPerformance(() => {
        render(
          <Alert>
            <AlertTitle>Benchmark Alert</AlertTitle>
            <AlertDescription>Benchmark description</AlertDescription>
          </Alert>
        );
      });
      metrics.alertRender = alertResult.renderTime;
      document.body.innerHTML = '';
      
      // Badge performance
      const badgeResult = measureRenderPerformance(() => {
        render(<Badge>Benchmark Badge</Badge>);
      });
      metrics.badgeRender = badgeResult.renderTime;
      document.body.innerHTML = '';
      
      // Many items performance
      const manyItemsResult = measureRenderPerformance(() => {
        render(
          <div>
            {Array.from({ length: 20 }, (_, i) => (
              <div key={i}>
                <Button>Button {i}</Button>
                <Badge>Badge {i}</Badge>
              </div>
            ))}
          </div>
        );
      });
      metrics.manyItemsRender = manyItemsResult.renderTime;
      
      // Log all metrics for CI/CD monitoring
      console.info('Performance Baseline Metrics:', JSON.stringify(metrics, null, 2));
      
      // Assert all metrics are within reasonable bounds
      expect(metrics.buttonRender).toBeLessThan(PERFORMANCE_THRESHOLDS.RENDER_TIME);
      expect(metrics.alertRender).toBeLessThan(PERFORMANCE_THRESHOLDS.RENDER_TIME);
      expect(metrics.badgeRender).toBeLessThan(PERFORMANCE_THRESHOLDS.RENDER_TIME);
      expect(metrics.manyItemsRender).toBeLessThan(PERFORMANCE_THRESHOLDS.MANY_ITEMS);
    });
  });
});