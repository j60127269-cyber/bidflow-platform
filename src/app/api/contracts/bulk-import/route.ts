import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface ContractData {
  reference_number: string;
  title: string;
  short_description?: string;
  category: string;
  procurement_method: string;
  estimated_value_min?: number;
  estimated_value_max?: number;
  currency: string;
  bid_fee?: number;
  bid_security_amount?: number;
  bid_security_type?: string;
  margin_of_preference: boolean;
  competition_level: 'low' | 'medium' | 'high' | 'very_high';
  publish_date?: string;
  pre_bid_meeting_date?: string;
  site_visit_date?: string;
  submission_deadline: string;
  bid_opening_date?: string;
  procuring_entity: string;
  contact_person?: string;
  contact_position?: string;
  evaluation_methodology?: string;
  requires_registration: boolean;
  requires_trading_license: boolean;
  requires_tax_clearance: boolean;
  requires_nssf_clearance: boolean;
  requires_manufacturer_auth: boolean;
  submission_method?: string;
  submission_format?: string;
  required_documents?: string[];

  bid_attachments?: string[];
  status: string;
  current_stage: string;
  award_information?: string;
  publish_status: 'draft' | 'published' | 'archived';
  published_at?: string;
  published_by?: string;
  detail_url?: string;
}

function processContractData(contract: any): ContractData {
  // Debug logging for problematic rows
  if (contract.reference_number === 'OP/SUPLS/2025-2026/00019') {
    console.log('🔍 Processing contract with reference_number:', contract.reference_number);
    console.log('  Type:', typeof contract.reference_number);
    console.log('  Length:', contract.reference_number?.length);
    console.log('  After trim:', contract.reference_number?.trim());
  }
  
  // Normalize bid_attachments input: accept array, JSON string, or comma-separated string
  const parseAttachments = (value: any): string[] => {
    try {
      if (!value) return [];
      if (Array.isArray(value)) return value.filter((v) => !!v && String(v).trim() !== '').map((v) => String(v).trim());
      if (typeof value === 'string') {
        const trimmed = value.trim();
        if (!trimmed) return [];
        // Try JSON first
        if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('"') && trimmed.endsWith('"')) || (trimmed.startsWith("['") && trimmed.endsWith("']"))) {
          // Handle common non-JSON single-quoted list format: ['https://...']
          if (trimmed.startsWith("['") && trimmed.endsWith("']")) {
            const inside = trimmed.slice(2, -2); // remove [' and ']
            return inside ? [inside.trim()] : [];
          }
          try {
            const parsed = JSON.parse(trimmed);
            if (Array.isArray(parsed)) return parsed.filter((v) => !!v && String(v).trim() !== '').map((v) => String(v).trim());
          } catch {}
        }
        // Fallback: comma separated
        return trimmed.split(',').map((s) => s.trim()).filter((s) => s !== '');
      }
      return [];
    } catch {
      return [];
    }
  };

  return {
    reference_number: contract.reference_number?.trim() || '',
    title: contract.title?.trim() || '',
    short_description: contract.short_description?.trim() || undefined,
    category: contract.category?.trim() || 'other',
    procurement_method: contract.procurement_method?.trim() || 'open domestic bidding',
    estimated_value_min: contract.estimated_value_min ? parseFloat(contract.estimated_value_min) : undefined,
    estimated_value_max: contract.estimated_value_max ? parseFloat(contract.estimated_value_max) : undefined,
    currency: contract.currency?.trim() || 'UGX',
    bid_fee: contract.bid_fee ? parseFloat(contract.bid_fee) : undefined,
    bid_security_amount: contract.bid_security_amount ? parseFloat(contract.bid_security_amount) : undefined,
    bid_security_type: contract.bid_security_type?.trim() || undefined,
    margin_of_preference: contract.margin_of_preference === 'true' || contract.margin_of_preference === '1',
    competition_level: (contract.competition_level?.toLowerCase() || 'medium') as 'low' | 'medium' | 'high' | 'very_high',
    publish_date: contract.publish_date?.trim() || undefined,
    pre_bid_meeting_date: contract.pre_bid_meeting_date?.trim() || undefined,
    site_visit_date: contract.site_visit_date?.trim() || undefined,
    submission_deadline: contract.submission_deadline?.trim() || new Date().toISOString().split('T')[0], // Default to today if missing
    bid_opening_date: contract.bid_opening_date?.trim() || undefined,
    procuring_entity: contract.procuring_entity?.trim() || 'Unknown Entity',
    contact_person: contract.contact_person?.trim() || undefined,
    contact_position: contract.contact_position?.trim() || undefined,
    evaluation_methodology: contract.evaluation_methodology?.trim() || 'Technical and Financial Evaluation',
    requires_registration: contract.requires_registration === 'true' || contract.requires_registration === '1',
    requires_trading_license: contract.requires_trading_license === 'true' || contract.requires_trading_license === '1',
    requires_tax_clearance: contract.requires_tax_clearance === 'true' || contract.requires_tax_clearance === '1',
    requires_nssf_clearance: contract.requires_nssf_clearance === 'true' || contract.requires_nssf_clearance === '1',
    requires_manufacturer_auth: contract.requires_manufacturer_auth === 'true' || contract.requires_manufacturer_auth === '1',
    submission_method: contract.submission_method?.trim() || 'electronic',
    submission_format: contract.submission_format?.trim() || 'electronic submission',
    required_documents: contract.required_documents ? contract.required_documents.split(',').map((doc: string) => doc.trim()) : [],

    status: (() => {
      const status = contract.status?.toLowerCase() || 'open';
      // Map common values to valid enum values
      if (status === 'active') return 'open';
      if (status === 'evaluating') return 'evaluating';
      if (status === 'awarded') return 'awarded';
      if (status === 'completed') return 'completed';
      if (status === 'cancelled') return 'cancelled';
      if (status === 'draft') return 'draft';
      return 'open'; // default
    })(),
    current_stage: (() => {
      const stage = contract.current_stage?.toLowerCase() || 'published';
      // Map common values to valid enum values
      if (stage === 'published') return 'published';
      if (stage === 'draft') return 'draft';
      if (stage === 'pre_bid_meeting') return 'pre_bid_meeting';
      if (stage === 'site_visit') return 'site_visit';
      if (stage === 'submission_open') return 'submission_open';
      if (stage === 'submission_closed') return 'submission_closed';
      if (stage === 'evaluation') return 'evaluation';
      if (stage === 'awarded') return 'awarded';
      if (stage === 'contract_signed') return 'contract_signed';
      if (stage === 'in_progress') return 'in_progress';
      if (stage === 'completed') return 'completed';
      if (stage === 'archived') return 'archived';
      return 'published'; // default
    })(),
    award_information: contract.award_information?.trim() || undefined,
    publish_status: (contract.publish_status?.toLowerCase() || 'draft') as 'draft' | 'published' | 'archived',
    published_at: undefined, // Will be set when admin publishes
    published_by: undefined, // Will be set when admin publishes
    detail_url: contract.detail_url?.trim() || undefined,
    bid_attachments: parseAttachments(contract.bid_attachments)
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log('Bulk import API called');
    const body = await request.json();
    const { contracts } = body;

    console.log('Received contracts:', contracts?.length || 0);

    if (!contracts || !Array.isArray(contracts)) {
      console.log('Invalid contracts data received');
      return NextResponse.json(
        { error: 'Invalid contracts data' },
        { status: 400 }
      );
    }

    const processedContracts = contracts.map(processContractData);
    console.log('Processed contracts:', processedContracts.length);
    
    // Log the first processed contract for debugging
    if (processedContracts.length > 0) {
      console.log('First processed contract:', JSON.stringify(processedContracts[0], null, 2));
    }
    
    // Validate required fields
    const validationErrors: string[] = [];
    processedContracts.forEach((contract, index) => {
      // Debug logging for problematic rows
      if (index === 40) { // Row 41 (0-indexed)
        console.log('🔍 Debugging Row 41:');
        console.log('  Original reference_number:', contracts[index]?.reference_number);
        console.log('  Trimmed reference_number:', contract.reference_number);
        console.log('  Length:', contract.reference_number?.length);
        console.log('  Is empty string:', contract.reference_number === '');
        console.log('  Is falsy:', !contract.reference_number);
      }
      
      if (!contract.reference_number || contract.reference_number.trim() === '') {
        validationErrors.push(`Row ${index + 1}: Reference number is required (got: "${contract.reference_number}")`);
      }
      if (!contract.title || contract.title.trim() === '') {
        validationErrors.push(`Row ${index + 1}: Title is required`);
      }
      if (!contract.category || contract.category.trim() === '') {
        validationErrors.push(`Row ${index + 1}: Category is required`);
      }
      if (!contract.procurement_method || contract.procurement_method.trim() === '') {
        validationErrors.push(`Row ${index + 1}: Procurement method is required`);
      }
      if (!contract.submission_deadline || contract.submission_deadline.trim() === '') {
        validationErrors.push(`Row ${index + 1}: Submission deadline is required`);
      }
      if (!contract.procuring_entity || contract.procuring_entity.trim() === '') {
        validationErrors.push(`Row ${index + 1}: Procuring entity is required`);
      }
    });

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { 
          error: 'Validation failed', 
          details: validationErrors,
          success: 0,
          failed: processedContracts.length,
          errors: validationErrors
        },
        { status: 400 }
      );
    }

    // Check for duplicate reference numbers
    const referenceNumbers = processedContracts.map(c => c.reference_number);
    const duplicateRefs = referenceNumbers.filter((ref, index) => referenceNumbers.indexOf(ref) !== index);
    
    if (duplicateRefs.length > 0) {
      return NextResponse.json(
        { 
          error: 'Duplicate reference numbers found', 
          details: duplicateRefs,
          success: 0,
          failed: processedContracts.length,
          errors: [`Duplicate reference numbers: ${duplicateRefs.join(', ')}`]
        },
        { status: 400 }
      );
    }

    // Check for existing reference numbers in database
    const { data: existingContracts, error: checkError } = await supabase
      .from('contracts')
      .select('reference_number')
      .in('reference_number', referenceNumbers);

    if (checkError) {
      console.error('Error checking existing contracts:', checkError);
      return NextResponse.json(
        { error: 'Failed to check existing contracts' },
        { status: 500 }
      );
    }

    // Filter out contracts whose reference_number already exists
    let contractsToInsert = processedContracts;
    let skippedExisting: string[] = [];
    if (existingContracts && existingContracts.length > 0) {
      const existingRefsSet = new Set(existingContracts.map(c => c.reference_number));
      skippedExisting = processedContracts
        .filter(c => existingRefsSet.has(c.reference_number))
        .map(c => c.reference_number);
      contractsToInsert = processedContracts.filter(c => !existingRefsSet.has(c.reference_number));
      console.log(`Skipping ${skippedExisting.length} existing contracts. Inserting ${contractsToInsert.length} new.`);
    }

    // Insert contracts
    console.log('Attempting to insert contracts into database...');
    console.log('Number of contracts to insert:', contractsToInsert.length);
    if (contractsToInsert.length > 0) {
      console.log('Sample contract data:', JSON.stringify(contractsToInsert[0], null, 2));
    }
    
    try {
      // Temporarily disable the trigger to avoid entity_type ambiguity
      console.log('Disabling trigger...');
      try {
        await supabase.rpc('disable_trigger');
      } catch (triggerError) {
        console.log('Could not disable trigger (might not exist):', triggerError);
      }
    
    const { data: insertedContracts, error: insertError } = await supabase
      .from('contracts')
        .insert(contractsToInsert)
      .select();
      
      // Re-enable the trigger
      console.log('Re-enabling trigger...');
      try {
        await supabase.rpc('enable_trigger');
      } catch (triggerError) {
        console.log('Could not enable trigger (might not exist):', triggerError);
      }

    if (insertError) {
      console.error('Error inserting contracts:', insertError);
      console.error('Error details:', insertError.details);
      console.error('Error hint:', insertError.hint);
        console.error('Error code:', insertError.code);
        console.error('Error message:', insertError.message);
        
        // Log the first few contracts that failed
        if (processedContracts.length > 0) {
          console.error('First contract data that failed:', JSON.stringify(processedContracts[0], null, 2));
        }
        
        return NextResponse.json(
          { 
            error: 'Failed to insert contracts',
            success: 0,
            failed: processedContracts.length,
            errors: [insertError.message],
            details: insertError.details,
            hint: insertError.hint,
            code: insertError.code
          },
          { status: 500 }
        );
      }

      const insertedCount = insertedContracts?.length || 0;
      console.log('Successfully inserted contracts:', insertedCount);

      return NextResponse.json({
        success: insertedCount,
        skipped_existing: skippedExisting.length,
        skipped_refs: skippedExisting,
        failed: 0,
        errors: [],
        data: insertedContracts
      });
    } catch (dbError) {
      console.error('Database operation error:', dbError);
      console.error('Error stack:', dbError instanceof Error ? dbError.stack : 'No stack trace');
      console.error('Error message:', dbError instanceof Error ? dbError.message : 'No error message');
      
      return NextResponse.json(
        { 
          error: 'Database operation failed',
          success: 0,
          failed: processedContracts.length,
          errors: [dbError instanceof Error ? dbError.message : 'Unknown database error'],
          details: 'Database operation failed during insert'
        },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('API error:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    console.error('Error message:', error instanceof Error ? error.message : 'No error message');
    return NextResponse.json(
      { 
        error: 'Internal server error',
        success: 0,
        failed: 0,
        errors: ['Internal server error'],
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
