import { NextRequest, NextResponse } from 'next/server';
import { getAwardeeStats } from '@/lib/awardeeUtils';

// GET /api/awardees/stats - Get awardee statistics
export async function GET(request: NextRequest) {
  try {
    const stats = await getAwardeeStats();

    return NextResponse.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
