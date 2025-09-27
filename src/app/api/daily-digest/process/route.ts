import { NextRequest, NextResponse } from 'next/server';
import { DailyDigestService } from '@/lib/daily-digest-service';

/**
 * API endpoint to process daily digest emails
 * This should be called by a cron job daily
 */
export async function POST(request: NextRequest) {
  try {
    console.log('Daily digest processing started via API');
    
    // Process daily digest for all users
    await DailyDigestService.processDailyDigest();
    
    return NextResponse.json({
      success: true,
      message: 'Daily digest processing completed successfully'
    });
  } catch (error) {
    console.error('Error processing daily digest:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to process daily digest',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * GET endpoint for testing daily digest processing
 */
export async function GET() {
  try {
    console.log('Daily digest test started via API');
    
    // Process daily digest for all users
    await DailyDigestService.processDailyDigest();
    
    return NextResponse.json({
      success: true,
      message: 'Daily digest test completed successfully'
    });
  } catch (error) {
    console.error('Error testing daily digest:', error);
    
    return NextResponse.json({
      success: false,
      error: 'Failed to test daily digest',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
