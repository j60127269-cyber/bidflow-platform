import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Checking real contracts in database...');
    
    // Get all contracts from the database
    const { data: contracts, error: contractsError } = await supabase
      .from('contracts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (contractsError) {
      console.error('Error fetching contracts:', contractsError);
      return NextResponse.json({ error: 'Failed to fetch contracts' }, { status: 500 });
    }

    // Get published contracts
    const { data: publishedContracts, error: publishedError } = await supabase
      .from('contracts')
      .select('*')
      .eq('publish_status', 'published')
      .order('published_at', { ascending: false })
      .limit(5);

    if (publishedError) {
      console.error('Error fetching published contracts:', publishedError);
    }

    // Get contract categories
    const { data: categories, error: categoriesError } = await supabase
      .from('contracts')
      .select('category')
      .not('category', 'is', null)
      .order('category');

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
    }

    const uniqueCategories = [...new Set(categories?.map(c => c.category) || [])];

    return NextResponse.json({
      success: true,
      message: 'Real contracts found in database',
      totalContracts: contracts?.length || 0,
      publishedContracts: publishedContracts?.length || 0,
      categories: uniqueCategories,
      sampleContracts: contracts?.slice(0, 3) || [],
      publishedSample: publishedContracts?.slice(0, 3) || []
    });

  } catch (error) {
    console.error('Error in check-real-contracts:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
