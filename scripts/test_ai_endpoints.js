// Test script for AI processing endpoints
// Run this after setting up the database columns

const BASE_URL = 'http://localhost:3000';

async function testAiEndpoints() {
  console.log('🧪 Testing AI Processing Endpoints...\n');

  try {
    // Test 1: Get a contract for processing
    console.log('1. Testing GET /api/ai/process/[contractId]');
    const testContractId = 'test-contract-id'; // Replace with actual contract ID
    
    const getResponse = await fetch(`${BASE_URL}/api/ai/process/${testContractId}`);
    const getData = await getResponse.json();
    
    console.log('GET Response:', getResponse.status, getData);
    console.log('');

    // Test 2: Update contract with AI results
    console.log('2. Testing POST /api/ai/update-contract');
    
    const updatePayload = {
      contractId: testContractId,
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
    
    const statusResponse = await fetch(`${BASE_URL}/api/ai/update-contract?contractId=${testContractId}`);
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
1. Run the SQL script: scripts/add_ai_processing_columns.sql in Supabase
2. Replace 'test-contract-id' with an actual contract ID from your database
3. Make sure your Next.js app is running on localhost:3000

To run the test:
node scripts/test_ai_endpoints.js

Expected Results:
- GET /api/ai/process/[contractId] should return contract data
- POST /api/ai/update-contract should update the contract with AI results
- GET /api/ai/update-contract should return the updated contract status
`);

// Uncomment the line below to run the test
// testAiEndpoints();

