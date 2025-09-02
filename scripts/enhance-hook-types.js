#!/usr/bin/env node

/**
 * Hook Type Enhancement Script
 * Adds explicit return types to hooks for better TypeScript experience
 * Focuses on hooks that don't already have return type annotations
 */

import fs from 'fs';
import path from 'path';

// Key hooks that need return type interfaces for better IDE support
const hooksToEnhance = [
  {
    file: 'src/hooks/useProjectManager.ts',
    interface: 'UseProjectManagerReturn'
  },
  {
    file: 'src/hooks/useInvoiceManager.ts', 
    interface: 'UseInvoiceManagerReturn'
  },
  {
    file: 'src/hooks/useDashboard.ts',
    interface: 'UseDashboardReturn'
  }
];

let enhancedHooks = 0;

function enhanceHookTypes(filePath, interfaceName) {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    
    if (!fs.existsSync(fullPath)) {
      console.log(`⚠️  File not found: ${filePath}`);
      return false;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Check if hook already has explicit return type
    if (content.includes(`): ${interfaceName}`) || content.includes('=> {')) {
      console.log(`⏭️  Hook already well-typed: ${filePath}`);
      return false;
    }
    
    // Find the hook export and return statement
    const exportMatch = content.match(/export const (use\w+) = \((.*?)\) => \{/);
    if (!exportMatch) {
      console.log(`⏭️  No hook pattern found in: ${filePath}`);
      return false;
    }
    
    const hookName = exportMatch[1];
    const params = exportMatch[2];
    
    // Find the return statement to analyze what it returns
    const returnMatch = content.match(/return\s+\{([^}]+)\}/s);
    if (!returnMatch) {
      console.log(`⏭️  No return object found in: ${filePath}`);
      return false;
    }
    
    const returnObject = returnMatch[1];
    const returnFields = returnObject
      .split(',')
      .map(field => field.trim())
      .filter(field => field && !field.startsWith('//'))
      .map(field => {
        const fieldName = field.split(':')[0].trim();
        // Try to infer type from usage
        if (fieldName.includes('loading') || fieldName.includes('Loading')) return `${fieldName}: boolean;`;
        if (fieldName.includes('error') || fieldName.includes('Error')) return `${fieldName}: Error | null;`;
        if (fieldName.includes('data') || fieldName.includes('Data')) return `${fieldName}: any; // TODO: Define specific type`;
        if (fieldName.startsWith('is') || fieldName.startsWith('has') || fieldName.startsWith('can')) return `${fieldName}: boolean;`;
        if (fieldName.includes('create') || fieldName.includes('update') || fieldName.includes('delete')) return `${fieldName}: (...args: any[]) => Promise<any>;`;
        return `${fieldName}: any; // TODO: Define specific type`;
      });
    
    // Create the interface
    const interfaceDefinition = `
interface ${interfaceName} {
  ${returnFields.join('\n  ')}
}

`;
    
    // Find good insertion point (after existing interfaces but before the hook)
    let insertionPoint = content.lastIndexOf('interface ');
    if (insertionPoint === -1) {
      // No existing interfaces, insert after imports
      insertionPoint = content.lastIndexOf('import ');
      if (insertionPoint !== -1) {
        insertionPoint = content.indexOf('\n', insertionPoint) + 1;
      } else {
        insertionPoint = 0;
      }
    } else {
      // After last interface
      insertionPoint = content.indexOf('\n}', insertionPoint) + 2;
    }
    
    // Insert interface and update function signature
    content = content.slice(0, insertionPoint) + interfaceDefinition + content.slice(insertionPoint);
    
    // Update the hook signature
    const newSignature = `export const ${hookName} = (${params}): ${interfaceName} => {`;
    content = content.replace(
      `export const ${hookName} = (${params}) => {`,
      newSignature
    );
    
    fs.writeFileSync(fullPath, content);
    console.log(`✅ Enhanced ${hookName} with ${interfaceName} interface`);
    enhancedHooks++;
    return true;
  } catch (error) {
    console.error(`❌ Error enhancing ${filePath}:`, error.message);
    return false;
  }
}

console.log('🚀 Starting hook type enhancement...\n');

hooksToEnhance.forEach(hook => {
  enhanceHookTypes(hook.file, hook.interface);
});

console.log('\n📊 Hook Enhancement Summary:');
console.log(`✅ Hooks enhanced: ${enhancedHooks}`);
console.log(`📁 Total hooks processed: ${hooksToEnhance.length}`);

console.log('\n🎯 TypeScript Benefits:');
console.log('- Better IDE autocomplete and IntelliSense');
console.log('- Improved type checking and error detection');
console.log('- Enhanced developer experience');
console.log('- Better code documentation through types');

console.log('\n✨ Hook type enhancement complete!');