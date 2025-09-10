import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Received body:', body);
    
    const { contractId, aiSummaryShort, aiCategory, processingStatus } = body;

    // Update the contract with AI processing results
    const updateData: any = {
      ai_processing_status: processingStatus,
      updated_at: new Date().toISOString(),
    };

    // Add AI results if processing was successful
    if (processingStatus === 'completed') {
      if (aiSummaryShort) {
        updateData.ai_summary_short = aiSummaryShort;
      }
      if (aiCategory) {
        updateData.ai_category = aiCategory;
      }
      updateData.ai_processed_at = new Date().toISOString();
    }

    console.log('Updating with data:', updateData);

    const { data: updatedContract, error } = await supabase
      .from('contracts')
      .update(updateData)
      .eq('id', contractId)
      .select('id, title, ai_summary_short, ai_category, ai_processing_status, ai_processed_at')
      .single();

    if (error) {
      console.error('Error updating contract:', error);
      return NextResponse.json(
        { error: 'Failed to update contract', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      contract: updatedContract,
      message: `Contract ${processingStatus === 'completed' ? 'successfully processed' : 'processing updated'}`
    });

  } catch (error) {
    console.error('Error in AI update endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

