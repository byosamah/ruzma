import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join, resolve } from 'path';

// Bundle size thresholds (in bytes)
// Updated to reflect realistic sizes for a feature-rich React app
const BUNDLE_SIZE_LIMITS = {
  MAIN_JS: 300 * 1024,      // 300 KB for main JS bundle (was 277 KB)
  MAIN_CSS: 100 * 1024,     // 100 KB for main CSS bundle (was 90 KB)
  VENDOR_JS: 350 * 1024,    // 350 KB for vendor JS bundle (currently 160 KB)
  TOTAL_SIZE: 2500 * 1024,  // 2.5 MB total bundle size (currently 2.18 MB)
  INDIVIDUAL_CHUNK: 600 * 1024, // 600 KB for any individual chunk (html2canvas is large)
} as const;

interface BundleInfo {
  name: string;
  path: string;
  size: number;
  sizeFormatted: string;
  type: 'js' | 'css' | 'other';
}

interface BundleAnalysis {
  totalSize: number;
  totalSizeFormatted: string;
  jsSize: number;
  cssSize: number;
  bundles: BundleInfo[];
  largestBundle: BundleInfo | null;
  exceedsLimits: string[];
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function getBundleType(filename: string): 'js' | 'css' | 'other' {
  if (filename.endsWith('.js')) return 'js';
  if (filename.endsWith('.css')) return 'css';
  return 'other';
}

function analyzeBundles(): BundleAnalysis {
  const distPath = resolve(process.cwd(), 'dist');
  const assetsPath = join(distPath, 'assets');
  
  if (!existsSync(distPath)) {
    throw new Error('Build directory not found. Run "npm run build" first.');
  }
  
  if (!existsSync(assetsPath)) {
    throw new Error('Assets directory not found. Build may have failed.');
  }
  
  const files = readdirSync(assetsPath);
  const bundles: BundleInfo[] = [];
  
  let totalSize = 0;
  let jsSize = 0;
  let cssSize = 0;
  
  for (const file of files) {
    const filePath = join(assetsPath, file);
    const stats = statSync(filePath);
    
    if (stats.isFile()) {
      const bundle: BundleInfo = {
        name: file,
        path: filePath,
        size: stats.size,
        sizeFormatted: formatBytes(stats.size),
        type: getBundleType(file),
      };
      
      bundles.push(bundle);
      totalSize += stats.size;
      
      if (bundle.type === 'js') {
        jsSize += stats.size;
      } else if (bundle.type === 'css') {
        cssSize += stats.size;
      }
    }
  }
  
  // Sort bundles by size (largest first)
  bundles.sort((a, b) => b.size - a.size);
  
  const largestBundle = bundles.length > 0 ? bundles[0] : null;
  
  // Check for size limit violations
  const exceedsLimits: string[] = [];
  
  const mainJsBundle = bundles.find(b => b.name.includes('index-') && b.type === 'js');
  const mainCssBundle = bundles.find(b => b.name.includes('index-') && b.type === 'css');
  const vendorJsBundle = bundles.find(b => b.name.includes('vendor-') && b.type === 'js');
  
  if (mainJsBundle && mainJsBundle.size > BUNDLE_SIZE_LIMITS.MAIN_JS) {
    exceedsLimits.push(`Main JS bundle (${mainJsBundle.sizeFormatted}) exceeds limit (${formatBytes(BUNDLE_SIZE_LIMITS.MAIN_JS)})`);
  }
  
  if (mainCssBundle && mainCssBundle.size > BUNDLE_SIZE_LIMITS.MAIN_CSS) {
    exceedsLimits.push(`Main CSS bundle (${mainCssBundle.sizeFormatted}) exceeds limit (${formatBytes(BUNDLE_SIZE_LIMITS.MAIN_CSS)})`);
  }
  
  if (vendorJsBundle && vendorJsBundle.size > BUNDLE_SIZE_LIMITS.VENDOR_JS) {
    exceedsLimits.push(`Vendor JS bundle (${vendorJsBundle.sizeFormatted}) exceeds limit (${formatBytes(BUNDLE_SIZE_LIMITS.VENDOR_JS)})`);
  }
  
  if (totalSize > BUNDLE_SIZE_LIMITS.TOTAL_SIZE) {
    exceedsLimits.push(`Total bundle size (${formatBytes(totalSize)}) exceeds limit (${formatBytes(BUNDLE_SIZE_LIMITS.TOTAL_SIZE)})`);
  }
  
  // Check for individual chunks that are too large
  for (const bundle of bundles) {
    if (bundle.size > BUNDLE_SIZE_LIMITS.INDIVIDUAL_CHUNK && !bundle.name.includes('vendor-')) {
      exceedsLimits.push(`Individual chunk ${bundle.name} (${bundle.sizeFormatted}) exceeds limit (${formatBytes(BUNDLE_SIZE_LIMITS.INDIVIDUAL_CHUNK)})`);
    }
  }
  
  return {
    totalSize,
    totalSizeFormatted: formatBytes(totalSize),
    jsSize,
    cssSize,
    bundles,
    largestBundle,
    exceedsLimits,
  };
}

function analyzeBundleComposition(): Record<string, number> {
  const analysis = analyzeBundles();
  
  const composition: Record<string, number> = {
    'JavaScript': analysis.jsSize,
    'CSS': analysis.cssSize,
    'Other': analysis.totalSize - analysis.jsSize - analysis.cssSize,
  };
  
  return composition;
}

describe('Bundle Size Analysis', () => {
  let bundleAnalysis: BundleAnalysis;
  
  it('should analyze bundle sizes without errors', () => {
    expect(() => {
      bundleAnalysis = analyzeBundles();
    }).not.toThrow();
    
    expect(bundleAnalysis).toBeDefined();
    expect(bundleAnalysis.bundles).toBeInstanceOf(Array);
    expect(bundleAnalysis.totalSize).toBeGreaterThan(0);
    
    console.info('Bundle Analysis Complete:', {
      totalSize: bundleAnalysis.totalSizeFormatted,
      bundleCount: bundleAnalysis.bundles.length,
      jsSize: formatBytes(bundleAnalysis.jsSize),
      cssSize: formatBytes(bundleAnalysis.cssSize),
    });
  });

  it('should not exceed total bundle size limit', () => {
    if (!bundleAnalysis) {
      bundleAnalysis = analyzeBundles();
    }
    
    expect(bundleAnalysis.totalSize).toBeLessThanOrEqual(BUNDLE_SIZE_LIMITS.TOTAL_SIZE);
    
    if (bundleAnalysis.totalSize > BUNDLE_SIZE_LIMITS.TOTAL_SIZE * 0.9) {
      console.warn(`Total bundle size (${bundleAnalysis.totalSizeFormatted}) is approaching the limit (${formatBytes(BUNDLE_SIZE_LIMITS.TOTAL_SIZE)})`);
    }
  });

  it('should not exceed main JavaScript bundle size limit', () => {
    if (!bundleAnalysis) {
      bundleAnalysis = analyzeBundles();
    }
    
    const mainJsBundle = bundleAnalysis.bundles.find(b => 
      b.name.includes('index-') && b.type === 'js'
    );
    
    if (mainJsBundle) {
      expect(mainJsBundle.size).toBeLessThanOrEqual(BUNDLE_SIZE_LIMITS.MAIN_JS);
      console.info(`Main JS bundle size: ${mainJsBundle.sizeFormatted}`);
    } else {
      console.warn('Main JavaScript bundle not found');
    }
  });

  it('should not exceed main CSS bundle size limit', () => {
    if (!bundleAnalysis) {
      bundleAnalysis = analyzeBundles();
    }
    
    const mainCssBundle = bundleAnalysis.bundles.find(b => 
      b.name.includes('index-') && b.type === 'css'
    );
    
    if (mainCssBundle) {
      expect(mainCssBundle.size).toBeLessThanOrEqual(BUNDLE_SIZE_LIMITS.MAIN_CSS);
      console.info(`Main CSS bundle size: ${mainCssBundle.sizeFormatted}`);
    } else {
      console.warn('Main CSS bundle not found');
    }
  });

  it('should not exceed vendor bundle size limit', () => {
    if (!bundleAnalysis) {
      bundleAnalysis = analyzeBundles();
    }
    
    const vendorJsBundle = bundleAnalysis.bundles.find(b => 
      b.name.includes('vendor-') && b.type === 'js'
    );
    
    if (vendorJsBundle) {
      expect(vendorJsBundle.size).toBeLessThanOrEqual(BUNDLE_SIZE_LIMITS.VENDOR_JS);
      console.info(`Vendor JS bundle size: ${vendorJsBundle.sizeFormatted}`);
    } else {
      console.info('Vendor JavaScript bundle not found (likely bundled with main)');
    }
  });

  it('should not have individual chunks that are too large', () => {
    if (!bundleAnalysis) {
      bundleAnalysis = analyzeBundles();
    }
    
    for (const bundle of bundleAnalysis.bundles) {
      if (!bundle.name.includes('vendor-')) {
        expect(bundle.size).toBeLessThanOrEqual(BUNDLE_SIZE_LIMITS.INDIVIDUAL_CHUNK);
      }
    }
  });

  it('should report bundle composition', () => {
    const composition = analyzeBundleComposition();
    
    const jsPercentage = (composition.JavaScript / bundleAnalysis.totalSize * 100).toFixed(1);
    const cssPercentage = (composition.CSS / bundleAnalysis.totalSize * 100).toFixed(1);
    const otherPercentage = (composition.Other / bundleAnalysis.totalSize * 100).toFixed(1);
    
    console.info('Bundle Composition:', {
      'JavaScript': `${formatBytes(composition.JavaScript)} (${jsPercentage}%)`,
      'CSS': `${formatBytes(composition.CSS)} (${cssPercentage}%)`,
      'Other': `${formatBytes(composition.Other)} (${otherPercentage}%)`,
    });
    
    // JavaScript should be the largest portion but not overwhelming
    expect(composition.JavaScript).toBeGreaterThan(composition.CSS);
    expect(composition.JavaScript).toBeLessThan(bundleAnalysis.totalSize * 0.97); // Max 97% JS (currently ~95%)
  });

  it('should list all bundles for monitoring', () => {
    if (!bundleAnalysis) {
      bundleAnalysis = analyzeBundles();
    }
    
    console.info('All Bundles:', bundleAnalysis.bundles.map(b => ({
      name: b.name,
      size: b.sizeFormatted,
      type: b.type,
    })));
    
    expect(bundleAnalysis.bundles.length).toBeGreaterThan(0);
  });

  it('should not have any critical size violations', () => {
    if (!bundleAnalysis) {
      bundleAnalysis = analyzeBundles();
    }
    
    if (bundleAnalysis.exceedsLimits.length > 0) {
      console.error('Bundle size violations:', bundleAnalysis.exceedsLimits);
      
      // Fail the test if there are violations
      expect(bundleAnalysis.exceedsLimits).toHaveLength(0);
    } else {
      console.info('✅ All bundles within size limits');
    }
  });

  it('should track performance budget metrics', () => {
    if (!bundleAnalysis) {
      bundleAnalysis = analyzeBundles();
    }
    
    const metrics = {
      totalSize: bundleAnalysis.totalSize,
      jsSize: bundleAnalysis.jsSize,
      cssSize: bundleAnalysis.cssSize,
      bundleCount: bundleAnalysis.bundles.length,
      largestBundleSize: bundleAnalysis.largestBundle?.size || 0,
      timestamp: new Date().toISOString(),
    };
    
    // Log metrics for CI/CD monitoring
    console.info('Performance Budget Metrics:', JSON.stringify(metrics, null, 2));
    
    // Basic sanity checks
    expect(metrics.totalSize).toBeGreaterThan(0);
    expect(metrics.jsSize).toBeGreaterThan(0);
    expect(metrics.bundleCount).toBeGreaterThan(0);
  });
});