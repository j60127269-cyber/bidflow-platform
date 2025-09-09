import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

// Validation schema for the request
const ProcessContractSchema = z.object({
  contractId: z.string().uuid(),
  attachmentUrls: z.array(z.string().url()).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: { contractId: string } }
) {
  try {
    const supabase = createClient();
    
    // Validate the contract ID
    const { contractId } = params;
    if (!contractId || typeof contractId !== 'string') {
      return NextResponse.json(
        { error: 'Invalid contract ID' },
        { status: 400 }
      );
    }

    // Get the contract from the database
    const { data: contract, error: contractError } = await supabase
      .from('contracts')
      .select('*')
      .eq('id', contractId)
      .single();

    if (contractError || !contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    // Check if contract already has AI processing
    if (contract.ai_summary_short || contract.ai_category) {
      return NextResponse.json(
        { 
          message: 'Contract already processed',
          contract: {
            id: contract.id,
            ai_summary_short: contract.ai_summary_short,
            ai_category: contract.ai_category
          }
        },
        { status: 200 }
      );
    }

    // Get attachment URLs from the contract
    const attachmentUrls = contract.attachments || [];
    
    if (attachmentUrls.length === 0) {
      return NextResponse.json(
        { error: 'No attachments found for processing' },
        { status: 400 }
      );
    }

    // For now, return the contract data that n8n can process
    // The actual AI processing will happen in the n8n workflow
    return NextResponse.json({
      success: true,
      contract: {
        id: contract.id,
        title: contract.title,
        description: contract.description,
        category: contract.category,
        attachmentUrls: attachmentUrls,
        currentStage: contract.current_stage,
        status: contract.status
      },
      message: 'Contract ready for AI processing'
    });

  } catch (error) {
    console.error('Error processing contract:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET endpoint to check contract status
export async function GET(
  request: NextRequest,
  { params }: { params: { contractId: string } }
) {
  try {
    const supabase = createClient();
    const { contractId } = params;

    const { data: contract, error } = await supabase
      .from('contracts')
      .select('id, title, ai_summary_short, ai_category, current_stage, status')
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
    console.error('Error fetching contract:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

