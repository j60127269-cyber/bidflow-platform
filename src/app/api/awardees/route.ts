import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { findOrCreateAwardee } from '@/lib/awardeeUtils';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/awardees - List all awardees with optional filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const location = searchParams.get('location') || '';
    const businessType = searchParams.get('business_type') || '';

    // First, get all awardees
    let query = supabase
      .from('awardees')
      .select('*', { count: 'exact' });

    // Apply search filter
    if (search) {
      query = query.ilike('company_name', `%${search}%`);
    }

    // Apply category filter
    if (category) {
      query = query.contains('primary_categories', [category]);
    }

    // Apply location filter
    if (location) {
      query = query.contains('locations', [location]);
    }

    // Apply business type filter
    if (businessType) {
      query = query.eq('business_type', businessType);
    }

    // Order by company name
    query = query.order('company_name', { ascending: true });

    const { data: awardees, error, count } = await query;

    if (error) {
      console.error('Error fetching awardees:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch awardees', 
        details: error 
      }, { status: 500 });
    }

    // Get all awarded contracts to calculate total values
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select(`
        id,
        awarded_company_id,
        awarded_to,
        awarded_value,
        estimated_value_max
      `)
      .eq('status', 'awarded');

    if (contractsError) {
      console.error('Error fetching contracts:', contractsError);
      return NextResponse.json({ 
        error: 'Failed to fetch contracts', 
        details: contractsError 
      }, { status: 500 });
    }

    // Calculate total values for each awardee
    const awardeesWithValues = awardees?.map(awardee => {
      let totalValue = 0;
      let contractCount = 0;

      // Find contracts for this awardee
      const awardeeContracts = contracts?.filter(contract => {
        // Match by awarded_company_id if available, otherwise by awarded_to
        return contract.awarded_company_id === awardee.id || 
               contract.awarded_to === awardee.company_name;
      }) || [];

      // Calculate total value and contract count
      awardeeContracts.forEach(contract => {
        const value = contract.awarded_value || contract.estimated_value_max || 0;
        totalValue += value;
        contractCount += 1;
      });

      return {
        ...awardee,
        total_awarded_value: totalValue,
        total_contracts: contractCount
      };
    }) || [];

    // Apply pagination after calculating values
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    const paginatedAwardees = awardeesWithValues.slice(from, to + 1);

    return NextResponse.json({ 
      success: true, 
      awardees: paginatedAwardees,
      pagination: {
        page,
        limit,
        total: awardeesWithValues.length,
        totalPages: Math.ceil(awardeesWithValues.length / limit)
      }
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error 
    }, { status: 500 });
  }
}

// POST /api/awardees - Create a new awardee
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate required fields
    if (!body.company_name) {
      return NextResponse.json({ 
        error: 'Company name is required' 
      }, { status: 400 });
    }

    // Use the shared findOrCreateAwardee function for consistency
    const awardee = await findOrCreateAwardee({
      company_name: body.company_name,
      registration_number: body.registration_number,
      business_type: body.business_type,
      female_owned: body.female_owned,
      primary_categories: body.primary_categories,
      locations: body.locations,
      contact_email: body.contact_email,
      contact_phone: body.contact_phone,
      website: body.website,
      address: body.address,
      description: body.description
    });

    return NextResponse.json({ 
      success: true, 
      awardee
    }, { status: 201 });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json({ 
      error: 'Internal server error', 
      details: error 
    }, { status: 500 });
  }
}
