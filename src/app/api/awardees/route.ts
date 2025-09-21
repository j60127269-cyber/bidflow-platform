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

    // Build the query
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

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

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

    return NextResponse.json({
      success: true,
      awardees: awardees || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
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
