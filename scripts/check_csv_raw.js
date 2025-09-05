// Check raw CSV content for hidden characters or encoding issues
const fs = require('fs');

console.log('🔍 Checking raw CSV content...');

try {
  const content = fs.readFileSync('egp_contracts_import_20250903_194650.csv', 'utf8');
  const lines = content.split('\n');
  
  console.log('Total lines:', lines.length);
  
  // Check line 41 (index 40)
  if (lines.length > 40) {
    console.log('\n🔍 Line 41 (raw):');
    console.log('Length:', lines[40].length);
    console.log('Content:', JSON.stringify(lines[40]));
    console.log('Hex:', Buffer.from(lines[40], 'utf8').toString('hex'));
    
    // Check for hidden characters
    const chars = lines[40].split('');
    console.log('\nCharacter analysis:');
    chars.forEach((char, index) => {
      if (char.charCodeAt(0) < 32 || char.charCodeAt(0) > 126) {
        console.log(`  Position ${index}: ${char.charCodeAt(0)} (${char})`);
      }
    });
  }
  
  // Check header line
  console.log('\n🔍 Header line:');
  console.log('Length:', lines[0].length);
  console.log('Content:', JSON.stringify(lines[0]));
  
} catch (error) {
  console.error('Error reading file:', error);
}
