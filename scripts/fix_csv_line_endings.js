// Fix CSV line endings by removing carriage returns
const fs = require('fs');

console.log('🔧 Fixing CSV line endings...');

try {
  // Read the original file
  const content = fs.readFileSync('egp_contracts_import_20250903_194650.csv', 'utf8');
  
  console.log('Original file size:', content.length, 'characters');
  console.log('Original line count:', content.split('\n').length);
  
  // Remove carriage returns and normalize line endings
  const fixedContent = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  
  console.log('Fixed file size:', fixedContent.length, 'characters');
  console.log('Fixed line count:', fixedContent.split('\n').length);
  
  // Write the fixed file
  const outputFilename = 'egp_contracts_import_20250903_194650_fixed.csv';
  fs.writeFileSync(outputFilename, fixedContent, 'utf8');
  
  console.log('✅ Fixed CSV saved as:', outputFilename);
  
  // Verify the fix
  const fixedLines = fixedContent.split('\n');
  if (fixedLines.length > 40) {
    console.log('\n🔍 Line 41 after fix:');
    console.log('Length:', fixedLines[40].length);
    console.log('Content:', JSON.stringify(fixedLines[40]));
    console.log('Ends with newline:', fixedLines[40].endsWith('\n'));
  }
  
} catch (error) {
  console.error('Error fixing file:', error);
}
