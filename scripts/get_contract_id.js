// Script to get a contract ID for testing AI endpoints
// This will help us test the AI processing functionality

const { createClient } = require('@supabase/supabase-js');

// You'll need to replace these with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'your-supabase-url';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

const supabase = createClient(supabaseUrl, supabaseKey);

async function getContractId() {
  try {
    console.log('🔍 Fetching a contract ID for testing...\n');

    // Get the first contract that has attachments
    const { data: contracts, error } = await supabase
      .from('contracts')
      .select('id, title, attachments, ai_processing_status')
      .not('attachments', 'is', null)
      .limit(1);

    if (error) {
      console.error('❌ Error fetching contracts:', error);
      return;
    }

    if (!contracts || contracts.length === 0) {
      console.log('⚠️  No contracts with attachments found. Let\'s get any contract...');
      
      // Get any contract
      const { data: anyContracts, error: anyError } = await supabase
        .from('contracts')
        .select('id, title, attachments, ai_processing_status')
        .limit(1);

      if (anyError) {
        console.error('❌ Error fetching any contracts:', anyError);
        return;
      }

      if (!anyContracts || anyContracts.length === 0) {
        console.log('❌ No contracts found in database. Please add some contracts first.');
        return;
      }

      const contract = anyContracts[0];
      console.log('📋 Found contract:');
      console.log(`   ID: ${contract.id}`);
      console.log(`   Title: ${contract.title}`);
      console.log(`   Attachments: ${contract.attachments ? contract.attachments.length : 0}`);
      console.log(`   AI Status: ${contract.ai_processing_status || 'not set'}`);
      console.log(`\n✅ Use this contract ID for testing: ${contract.id}`);
      return;
    }

    const contract = contracts[0];
    console.log('📋 Found contract with attachments:');
    console.log(`   ID: ${contract.id}`);
    console.log(`   Title: ${contract.title}`);
    console.log(`   Attachments: ${contract.attachments.length}`);
    console.log(`   AI Status: ${contract.ai_processing_status || 'not set'}`);
    console.log(`\n✅ Use this contract ID for testing: ${contract.id}`);

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// Instructions
console.log(`
📋 Contract ID Fetcher

This script will help you get a contract ID for testing the AI endpoints.

Before running:
1. Make sure you have contracts in your database
2. Set your Supabase credentials in the script or as environment variables

To run:
node scripts/get_contract_id.js

The script will output a contract ID that you can use to test the AI processing endpoints.
`);

// Uncomment to run
// getContractId();

