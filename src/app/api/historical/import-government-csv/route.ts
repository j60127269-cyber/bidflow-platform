import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { GovernmentCsvProcessor, GovernmentCsvRow } from '@/lib/dataProcessors/governmentCsvProcessor';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);



export async function POST(request: NextRequest) {
  try {
    console.log('Historical data import API called');
    
    const body = await request.json();
    const { csvData, fileName, fiscalYear } = body;

    if (!csvData || !Array.isArray(csvData)) {
      return NextResponse.json(
        { error: 'Invalid data provided' },
        { status: 400 }
      );
    }

    if (!fileName) {
      return NextResponse.json(
        { error: 'File name is required' },
        { status: 400 }
      );
    }

    if (!fiscalYear) {
      return NextResponse.json(
        { error: 'Fiscal year is required' },
        { status: 400 }
      );
    }

    // Validate data structure - MOWT format
    const requiredColumns = [
      'provider',
      'female_owned', 
      'entity',
      'proc_reference_no',
      'subject_of_procurement',
      'contract_award_date',
      'contract_amt_ugx',
      'status'
    ];

    const firstRow = csvData[0];
    if (!firstRow) {
      return NextResponse.json(
        { error: 'Data file is empty' },
        { status: 400 }
      );
    }

    // Check for required columns
    const missingRequiredColumns = [];
    const foundColumns = Object.keys(firstRow);
    
    // Check for required columns
    if (!foundColumns.includes('provider')) missingRequiredColumns.push('provider');
    if (!foundColumns.includes('female_owned')) missingRequiredColumns.push('female_owned');
    if (!foundColumns.includes('entity')) missingRequiredColumns.push('entity');
    if (!foundColumns.includes('proc_reference_no')) {
      missingRequiredColumns.push('proc_reference_no');
    }
    if (!foundColumns.includes('subject_of_procurement')) missingRequiredColumns.push('subject_of_procurement');
    if (!foundColumns.includes('contract_award_date')) missingRequiredColumns.push('contract_award_date');
    if (!foundColumns.includes('contract_amt_ugx')) missingRequiredColumns.push('contract_amt_ugx');
    if (!foundColumns.includes('status')) missingRequiredColumns.push('status');
    
    if (missingRequiredColumns.length > 0) {
      return NextResponse.json(
        { 
          error: `Missing required columns: ${missingRequiredColumns.join(', ')}`,
          expectedColumns: requiredColumns,
          foundColumns: foundColumns
        },
        { status: 400 }
      );
    }

    // Process the data
    const processor = new GovernmentCsvProcessor(fileName, fiscalYear);
    const result = await processor.processData(csvData);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: `Successfully imported ${result.successfulImports} records`,
        data: {
          totalRecords: result.totalRecords,
          successfulImports: result.successfulImports,
          failedImports: result.failedImports,
          importLogId: result.importLogId
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        message: `Import completed with errors. ${result.successfulImports} successful, ${result.failedImports} failed`,
        data: {
          totalRecords: result.totalRecords,
          successfulImports: result.successfulImports,
          failedImports: result.failedImports,
          errors: result.errors,
          importLogId: result.importLogId
        }
      }, { status: 207 }); // 207 Multi-Status
    }

  } catch (error) {
    console.error('Error in historical data import:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get import logs for the admin interface
    const { data: importLogs, error } = await supabase
      .from('data_import_logs')
      .select('*')
      .eq('import_type', 'government_csv')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      throw error;
    }

    return NextResponse.json({
      success: true,
      data: importLogs
    });

  } catch (error) {
    console.error('Error fetching import logs:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch import logs',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
