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
  required_forms?: string[];
  bid_attachments?: string[];
  status: string;
  current_stage: string;
  award_information?: string;
}

function processContractData(contract: any): ContractData {
  return {
    reference_number: contract.reference_number?.trim() || '',
    title: contract.title?.trim() || '',
    short_description: contract.short_description?.trim() || null,
    category: contract.category?.trim() || '',
    procurement_method: contract.procurement_method?.trim() || '',
    estimated_value_min: contract.estimated_value_min ? parseFloat(contract.estimated_value_min) : null,
    estimated_value_max: contract.estimated_value_max ? parseFloat(contract.estimated_value_max) : null,
    currency: contract.currency?.trim() || 'UGX',
    bid_fee: contract.bid_fee ? parseFloat(contract.bid_fee) : null,
    bid_security_amount: contract.bid_security_amount ? parseFloat(contract.bid_security_amount) : null,
    bid_security_type: contract.bid_security_type?.trim() || null,
    margin_of_preference: contract.margin_of_preference === 'true' || contract.margin_of_preference === '1',
    competition_level: (contract.competition_level?.toLowerCase() || 'medium') as 'low' | 'medium' | 'high' | 'very_high',
    publish_date: contract.publish_date?.trim() || null,
    pre_bid_meeting_date: contract.pre_bid_meeting_date?.trim() || null,
    site_visit_date: contract.site_visit_date?.trim() || null,
    submission_deadline: contract.submission_deadline?.trim() || '',
    bid_opening_date: contract.bid_opening_date?.trim() || null,
    procuring_entity: contract.procuring_entity?.trim() || '',
    contact_person: contract.contact_person?.trim() || null,
    contact_position: contract.contact_position?.trim() || null,
    evaluation_methodology: contract.evaluation_methodology?.trim() || null,
    requires_registration: contract.requires_registration === 'true' || contract.requires_registration === '1',
    requires_trading_license: contract.requires_trading_license === 'true' || contract.requires_trading_license === '1',
    requires_tax_clearance: contract.requires_tax_clearance === 'true' || contract.requires_tax_clearance === '1',
    requires_nssf_clearance: contract.requires_nssf_clearance === 'true' || contract.requires_nssf_clearance === '1',
    requires_manufacturer_auth: contract.requires_manufacturer_auth === 'true' || contract.requires_manufacturer_auth === '1',
    submission_method: contract.submission_method?.trim() || null,
    submission_format: contract.submission_format?.trim() || null,
    required_documents: contract.required_documents ? contract.required_documents.split(',').map((doc: string) => doc.trim()) : [],
    required_forms: contract.required_forms ? contract.required_forms.split(',').map((form: string) => form.trim()) : [],
    status: (contract.status?.toLowerCase() || 'open') as string,
    current_stage: (contract.current_stage?.toLowerCase() || 'published') as string,
    award_information: contract.award_information?.trim() || null,
    bid_attachments: [] // Empty array for imported contracts
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
    
    // Validate required fields
    const validationErrors: string[] = [];
    processedContracts.forEach((contract, index) => {
      if (!contract.reference_number) {
        validationErrors.push(`Row ${index + 1}: Reference number is required`);
      }
      if (!contract.title) {
        validationErrors.push(`Row ${index + 1}: Title is required`);
      }
      if (!contract.category) {
        validationErrors.push(`Row ${index + 1}: Category is required`);
      }
      if (!contract.procurement_method) {
        validationErrors.push(`Row ${index + 1}: Procurement method is required`);
      }
      if (!contract.submission_deadline) {
        validationErrors.push(`Row ${index + 1}: Submission deadline is required`);
      }
      if (!contract.procuring_entity) {
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

    if (existingContracts && existingContracts.length > 0) {
      const existingRefs = existingContracts.map(c => c.reference_number);
      return NextResponse.json(
        { 
          error: 'Some reference numbers already exist', 
          details: existingRefs,
          success: 0,
          failed: processedContracts.length,
          errors: [`Reference numbers already exist: ${existingRefs.join(', ')}`]
        },
        { status: 400 }
      );
    }

    // Insert contracts
    console.log('Attempting to insert contracts into database...');
    console.log('Sample contract data:', processedContracts[0]);
    
    const { data: insertedContracts, error: insertError } = await supabase
      .from('contracts')
      .insert(processedContracts)
      .select();

    if (insertError) {
      console.error('Error inserting contracts:', insertError);
      console.error('Error details:', insertError.details);
      console.error('Error hint:', insertError.hint);
      return NextResponse.json(
        { 
          error: 'Failed to insert contracts',
          success: 0,
          failed: processedContracts.length,
          errors: [insertError.message]
        },
        { status: 500 }
      );
    }

    console.log('Successfully inserted contracts:', insertedContracts?.length || 0);

    return NextResponse.json({
      success: insertedContracts?.length || 0,
      failed: 0,
      errors: [],
      data: insertedContracts
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        success: 0,
        failed: 0,
        errors: ['Internal server error']
      },
      { status: 500 }
    );
  }
}
