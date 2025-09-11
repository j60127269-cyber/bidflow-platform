// Test script for AI processing endpoints
// Run this after setting up the database columns

const BASE_URL = 'http://localhost:3000';

async function testAiEndpoints(contractId) {
  console.log('🧪 Testing AI Processing Endpoints...\n');
  console.log(`Testing with contract ID: ${contractId}\n`);

  try {
    // Test 1: Get a contract for processing
    console.log('1. Testing GET /api/ai/process/[contractId]');
    
    const getResponse = await fetch(`${BASE_URL}/api/ai/process/${contractId}`);
    const getData = await getResponse.json();
    
    console.log('GET Response:', getResponse.status, getData);
    console.log('');

    // Test 2: Update contract with AI results
    console.log('2. Testing POST /api/ai/update-contract');
    
    const updatePayload = {
      contractId: contractId,
      aiSummaryShort: 'AI-generated summary: This contract involves procurement of ICT hardware and software solutions for digital work environments.',
      aiCategory: 'Information Technology',
      processingStatus: 'completed'
    };

    const updateResponse = await fetch(`${BASE_URL}/api/ai/update-contract`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatePayload)
    });

    const updateData = await updateResponse.json();
    console.log('UPDATE Response:', updateResponse.status, updateData);
    console.log('');

    // Test 3: Check AI processing status
    console.log('3. Testing GET /api/ai/update-contract?contractId=...');
    
    const statusResponse = await fetch(`${BASE_URL}/api/ai/update-contract?contractId=${contractId}`);
    const statusData = await statusResponse.json();
    
    console.log('STATUS Response:', statusResponse.status, statusData);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

// Instructions for running the test
console.log(`
📋 AI Endpoints Test Script

Before running this test:
1. ✅ SQL script has been run successfully
2. Make sure your Next.js app is running on localhost:3000
3. Get a contract ID from your database

To get a contract ID, run this SQL in Supabase:
SELECT id, title, attachments 
FROM contracts 
WHERE attachments IS NOT NULL 
AND array_length(attachments, 1) > 0
LIMIT 1;

To run the test:
node scripts/test_ai_endpoints.js

Or test with a specific contract ID:
node -e "require('./scripts/test_ai_endpoints.js').testAiEndpoints('YOUR_CONTRACT_ID_HERE')"
`);

// Export the function for testing
module.exports = { testAiEndpoints };
