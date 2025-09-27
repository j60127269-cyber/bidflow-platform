import { NextRequest, NextResponse } from 'next/server';
import { ContractMatchingService } from '@/lib/contract-matching';

/**
 * API endpoint to process contract matching
 * This should be called by a cron job every 6 hours
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Contract matching processing started via API');
    
    // Process contract matching for new contracts
    await ContractMatchingService.processNewContracts();
    
    return NextResponse.json({
      success: true,
      message: 'Contract matching processing completed successfully'
    });
  } catch (error) {
    console.error('Error processing contract matching:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process contract matching',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * GET endpoint for testing contract matching
 */
export async function GET() {
  try {
    console.log('Contract matching test started via API');
    
    // Process contract matching for new contracts
    await ContractMatchingService.processNewContracts();
    
    return NextResponse.json({
      success: true,
      message: 'Contract matching test completed successfully'
    });
  } catch (error) {
    console.error('Error testing contract matching:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to test contract matching',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
