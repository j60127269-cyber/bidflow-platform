import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

// Validation schema for AI processing results
const UpdateContractSchema = z.object({
  contractId: z.string().uuid(),
  aiSummaryShort: z.string().optional(),
  aiCategory: z.string().optional(),
  processingStatus: z.enum(['processing', 'completed', 'failed']),
  errorMessage: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();
    
    // Parse and validate the request body
    const body = await request.json();
    const validatedData = UpdateContractSchema.parse(body);
    
    const { contractId, aiSummaryShort, aiCategory, processingStatus, errorMessage } = validatedData;

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

    // Add error message if processing failed
    if (processingStatus === 'failed' && errorMessage) {
      updateData.ai_processing_status = 'failed';
      // You could also store the error message in a separate field if needed
    }

    const { data: updatedContract, error } = await supabase
      .from('contracts')
      .update(updateData)
      .eq('id', contractId)
      .select('id, title, ai_summary_short, ai_category, ai_processing_status, ai_processed_at')
      .single();

    if (error) {
      console.error('Error updating contract:', error);
      return NextResponse.json(
        { error: 'Failed to update contract' },
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
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check AI processing status
export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();
    const { searchParams } = new URL(request.url);
    const contractId = searchParams.get('contractId');

    if (!contractId) {
      return NextResponse.json(
        { error: 'Contract ID is required' },
        { status: 400 }
      );
    }

    const { data: contract, error } = await supabase
      .from('contracts')
      .select('id, title, ai_summary_short, ai_category, ai_processing_status, ai_processed_at')
      .eq('id', contractId)
      .single();

    if (error || !contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      contract,
      hasAiProcessing: !!(contract.ai_summary_short || contract.ai_category)
    });

  } catch (error) {
    console.error('Error fetching AI processing status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

