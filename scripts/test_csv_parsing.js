// Test CSV parsing to debug the reference number issue
const fs = require('fs');
const csv = require('csv-parser');

console.log('🔍 Testing fixed CSV parsing...');

const results = [];
let rowCount = 0;

fs.createReadStream('egp_contracts_import_20250903_194650_fixed.csv')
  .pipe(csv())
  .on('data', (data) => {
    rowCount++;
    if (rowCount === 41) {
      console.log('🔍 Row 41 data:');
      console.log('  Raw reference_number:', JSON.stringify(data.reference_number));
      console.log('  Type:', typeof data.reference_number);
      console.log('  Length:', data.reference_number?.length);
      console.log('  After trim:', data.reference_number?.trim());
      console.log('  Is empty after trim:', data.reference_number?.trim() === '');
      console.log('  Full row:', JSON.stringify(data, null, 2));
    }
    results.push(data);
  })
  .on('end', () => {
    console.log('✅ CSV parsing complete');
    console.log('Total rows:', rowCount);
    console.log('Row 41 reference_number:', results[40]?.reference_number);
  });
