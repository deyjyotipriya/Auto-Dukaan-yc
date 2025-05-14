#!/usr/bin/env node

/**
 * Script to find potential instances where class constructors 
 * may be called without the 'new' keyword.
 * 
 * Usage:
 *   node find-missing-new.js [directory]
 * 
 * If directory is not specified, it defaults to the current directory.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Regex patterns to match potential issues
const PATTERNS = [
  // Pattern 1: Direct call to capital-case-named function without new
  // Example: Constructor() instead of new Constructor()
  /\b([A-Z][a-zA-Z0-9_]*)(\s*)\(/g,
  
  // Pattern 2: Capital-case-named function assigned to a variable without new
  // Example: const x = Constructor() instead of const x = new Constructor()
  /(?:const|let|var)\s+[a-zA-Z0-9_]+\s*=\s*([A-Z][a-zA-Z0-9_]*)(\s*)\(/g,
  
  // Pattern 3: Check for React component usage without JSX
  // Example: Component() instead of <Component />
  /\breturn\s+(?!<)([A-Z][a-zA-Z0-9_]*)(\s*)\(/g,
];

// Extensions to scan
const EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];

// Directories to exclude
const EXCLUDED_DIRS = ['node_modules', 'dist', 'build', '.git', '.github'];

// Get the directory to scan
const scanDir = process.argv[2] || '.';
const fullScanDir = path.resolve(scanDir);

console.log(`Scanning directory: ${fullScanDir}`);

// Class to store information about findings
class Finding {
  constructor(filePath, lineNumber, line, pattern) {
    this.filePath = filePath;
    this.lineNumber = lineNumber;
    this.line = line.trim();
    this.pattern = pattern;
  }

  toString() {
    return `${this.filePath}:${this.lineNumber}\n  ${this.line}\n  Possible missing 'new' keyword for class constructor\n`;
  }
}

const findings = [];

// Function to scan a file
function scanFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      for (const pattern of PATTERNS) {
        const matches = [...line.matchAll(pattern)];
        
        for (const match of matches) {
          // Skip if there's a 'new' keyword before the match
          const beforeMatch = line.substring(0, match.index);
          if (beforeMatch.match(/new\s*$/)) continue;
          
          // Skip JSX-like components (React)
          if (filePath.endsWith('.jsx') || filePath.endsWith('.tsx')) {
            // If it's in JSX, it's likely a component, not a class constructor
            if (line.includes('<') && line.includes('/>')) continue;
            if (beforeMatch.includes('return') && match[0].includes('(')) continue;
          }
          
          // Skip known false positives
          if (match[1] === 'Error' || match[1] === 'Map' || match[1] === 'Set') continue;
          if (line.includes('React.') || line.includes('import ')) continue;
          
          findings.push(new Finding(filePath, i + 1, line, match[0]));
        }
      }
    }
  } catch (error) {
    console.error(`Error scanning file ${filePath}:`, error.message);
  }
}

// Function to check if a file should be scanned
function shouldScanFile(filePath) {
  const ext = path.extname(filePath);
  return EXTENSIONS.includes(ext);
}

// Function to find all matching files
function findFilesToScan(directory) {
  try {
    const result = execSync(`find ${directory} -type f | grep -v "node_modules\\|dist\\|build\\|.git"`, { encoding: 'utf8' });
    return result.split('\n').filter(file => shouldScanFile(file));
  } catch (error) {
    console.error('Error finding files:', error.message);
    return [];
  }
}

// Find and scan all matching files
const filesToScan = findFilesToScan(fullScanDir);
console.log(`Found ${filesToScan.length} files to scan`);

for (const file of filesToScan) {
  scanFile(file);
}

// Print results
console.log(`\nFound ${findings.length} potential issues:\n`);
findings.forEach(finding => console.log(finding.toString()));

console.log(`\nPossible solutions:
1. Add 'new' keyword before constructor calls: new ClassName()
2. Convert class to factory function if 'new' is intentionally omitted
3. For React components, ensure they're used with JSX: <Component /> not Component()
4. For 3rd party libraries, check documentation for proper usage
`);

// Additionally, look for specific "aS" class references which matches the error
console.log('Checking for specific "aS" class references related to the error:');
try {
  const result = execSync(`grep -r "aS" --include="*.js" --include="*.jsx" --include="*.ts" --include="*.tsx" ${fullScanDir} 2>/dev/null || true`, { encoding: 'utf8' });
  console.log(result || 'No direct references to "aS" found (this is expected for minified code)');
} catch (error) {
  console.log('No direct references to "aS" found (this is expected for minified code)');
}