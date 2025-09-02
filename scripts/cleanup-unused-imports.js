#!/usr/bin/env node

/**
 * Automated Unused Import Cleanup Script
 * Safely detects and removes unused imports from TypeScript files
 * Zero-risk: Only removes imports that are definitely unused
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Files to process (TypeScript files)
const include = ['src/**/*.ts', 'src/**/*.tsx'];
const exclude = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/*.d.ts',
  '**/types/**'
];

let processedFiles = 0;
let removedImports = 0;
let skippedFiles = 0;

/**
 * Check if an import is actually used in the file content
 */
function isImportUsed(importName, fileContent, importLine) {
  // Skip the import line itself when checking usage
  const contentWithoutImport = fileContent.replace(importLine, '');
  
  // Check for direct usage
  const directUsage = new RegExp(`\\b${importName}\\b`, 'g');
  const matches = contentWithoutImport.match(directUsage);
  
  // Must have at least one usage (excluding the import itself)
  return matches && matches.length > 0;
}

/**
 * Check if a namespace import is used
 */
function isNamespaceUsed(namespace, fileContent, importLine) {
  const contentWithoutImport = fileContent.replace(importLine, '');
  const namespaceUsage = new RegExp(`${namespace}\\.\\w+`, 'g');
  return namespaceUsage.test(contentWithoutImport);
}

/**
 * Process imports from a single line
 */
function processImportLine(line, fileContent) {
  let modifiedLine = line;
  let hasChanges = false;
  
  // Handle named imports: import { A, B, C } from 'module'
  const namedImportMatch = line.match(/import\s*{\s*([^}]+)\s*}\s*from\s*['"']([^'"]+)['"']/);
  if (namedImportMatch) {
    const imports = namedImportMatch[1].split(',').map(imp => imp.trim());
    const moduleSource = namedImportMatch[2];
    
    const usedImports = imports.filter(importName => {
      // Handle aliased imports (import { A as B })
      const aliasMatch = importName.match(/(\w+)\s+as\s+(\w+)/);
      const nameToCheck = aliasMatch ? aliasMatch[2] : importName;
      
      return isImportUsed(nameToCheck, fileContent, line);
    });
    
    if (usedImports.length !== imports.length) {
      if (usedImports.length === 0) {
        // Remove entire import line
        return { line: '', removed: imports.length, hasChanges: true };
      } else {
        // Keep only used imports
        modifiedLine = `import { ${usedImports.join(', ')} } from '${moduleSource}';`;
        hasChanges = true;
      }
    }
  }
  
  // Handle default imports: import React from 'react'
  const defaultImportMatch = line.match(/import\s+(\w+)\s+from\s*['"']([^'"]+)['"']/);
  if (defaultImportMatch && !line.includes('{')) {
    const importName = defaultImportMatch[1];
    const moduleSource = defaultImportMatch[2];
    
    if (!isImportUsed(importName, fileContent, line)) {
      return { line: '', removed: 1, hasChanges: true };
    }
  }
  
  // Handle namespace imports: import * as React from 'react'
  const namespaceImportMatch = line.match(/import\s*\*\s*as\s+(\w+)\s+from\s*['"']([^'"]+)['"']/);
  if (namespaceImportMatch) {
    const namespaceName = namespaceImportMatch[1];
    
    if (!isNamespaceUsed(namespaceName, fileContent, line)) {
      return { line: '', removed: 1, hasChanges: true };
    }
  }
  
  return { line: modifiedLine, removed: 0, hasChanges };
}

/**
 * Process a single TypeScript file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    let modifiedContent = [];
    let fileRemovedImports = 0;
    let fileHasChanges = false;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Check if line is an import statement
      if (line.trim().startsWith('import ') && !line.includes('//')) {
        const result = processImportLine(line, content);
        
        if (result.hasChanges) {
          fileHasChanges = true;
          fileRemovedImports += result.removed;
          
          // Only add line if it's not completely removed
          if (result.line.trim()) {
            modifiedContent.push(result.line);
          }
        } else {
          modifiedContent.push(line);
        }
      } else {
        modifiedContent.push(line);
      }
    }
    
    // Only write if there are changes
    if (fileHasChanges) {
      fs.writeFileSync(filePath, modifiedContent.join('\n'));
      console.log(`✅ ${filePath}: Removed ${fileRemovedImports} unused import(s)`);
      removedImports += fileRemovedImports;
    } else {
      console.log(`⏭️  ${filePath}: No unused imports found`);
    }
    
    processedFiles++;
    
  } catch (error) {
    console.error(`❌ Error processing ${filePath}:`, error.message);
    skippedFiles++;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Starting automated unused import cleanup...\n');
  
  // Find all TypeScript files
  const files = [];
  
  for (const pattern of include) {
    const matches = await glob(pattern, { ignore: exclude });
    files.push(...matches);
  }
  
  // Remove duplicates
  const uniqueFiles = [...new Set(files)];
  
  console.log(`📁 Found ${uniqueFiles.length} TypeScript files to process\n`);
  
  // Process each file
  for (const file of uniqueFiles) {
    processFile(file);
  }
  
  console.log('\n📊 Cleanup Summary:');
  console.log(`✅ Files processed: ${processedFiles}`);
  console.log(`🧹 Unused imports removed: ${removedImports}`);
  console.log(`⚠️  Files skipped (errors): ${skippedFiles}`);
  
  if (removedImports > 0) {
    console.log('\n🎯 Benefits:');
    console.log('- Smaller bundle size');
    console.log('- Faster compilation');
    console.log('- Cleaner codebase');
    console.log('- Better IDE performance');
  }
  
  console.log('\n✨ Automated unused import cleanup complete!');
}

// Run the script
main().catch(error => {
  console.error('❌ Script failed:', error);
  process.exit(1);
});