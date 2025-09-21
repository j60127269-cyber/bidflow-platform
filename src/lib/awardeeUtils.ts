import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export interface AwardeeData {
  company_name: string;
  registration_number?: string;
  business_type?: string;
  female_owned?: boolean;
  primary_categories?: string[];
  locations?: string[];
  contact_email?: string;
  contact_phone?: string;
  website?: string;
  address?: string;
  description?: string;
}

/**
 * Find or create an awardee - integrates with existing system logic
 * This function maintains compatibility with the existing findOrCreateAwardee function
 * used in governmentCsvProcessor.ts while providing enhanced functionality
 */
export async function findOrCreateAwardee(awardeeData: AwardeeData): Promise<any> {
  // First try to find existing awardee by name (fuzzy match)
  const { data: existing } = await supabase
    .from('awardees')
    .select('*')
    .ilike('company_name', `%${awardeeData.company_name}%`)
    .single();

  if (existing) {
    // Update with new information if needed
    const updateData: any = {
      updated_at: new Date().toISOString()
    };

    // Only update fields that have new values
    if (awardeeData.business_type) updateData.business_type = awardeeData.business_type;
    if (awardeeData.female_owned !== undefined) updateData.female_owned = awardeeData.female_owned;
    if (awardeeData.primary_categories) updateData.primary_categories = awardeeData.primary_categories;
    if (awardeeData.locations) updateData.locations = awardeeData.locations;
    if (awardeeData.contact_email) updateData.contact_email = awardeeData.contact_email;
    if (awardeeData.contact_phone) updateData.contact_phone = awardeeData.contact_phone;
    if (awardeeData.website) updateData.website = awardeeData.website;
    if (awardeeData.description) updateData.notes = awardeeData.description; // Map description to notes
    if (awardeeData.registration_number) updateData.registration_number = awardeeData.registration_number;

    await supabase
      .from('awardees')
      .update(updateData)
      .eq('id', existing.id);
    
    return existing;
  }

  // Create new awardee
  const { data: newAwardee, error } = await supabase
    .from('awardees')
    .insert([{
      company_name: awardeeData.company_name,
      registration_number: awardeeData.registration_number || null,
      business_type: awardeeData.business_type || null,
      female_owned: awardeeData.female_owned || false,
      primary_categories: awardeeData.primary_categories || [],
      locations: awardeeData.locations || [],
      contact_email: awardeeData.contact_email || null,
      contact_phone: awardeeData.contact_phone || null,
      website: awardeeData.website || null,
      notes: awardeeData.description || null, // Map description to notes field
      is_active: true,
      entity_type: 'company',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }])
    .select()
    .single();

  if (error) throw new Error(`Failed to create awardee: ${error.message}`);
  return newAwardee;
}

/**
 * Search awardees with fuzzy matching
 */
export async function searchAwardees(query: string, limit: number = 10): Promise<any[]> {
  const { data, error } = await supabase
    .from('awardees')
    .select('id, company_name, business_type, primary_categories, locations')
    .ilike('company_name', `%${query}%`)
    .limit(limit)
    .order('company_name', { ascending: true });

  if (error) {
    console.error('Error searching awardees:', error);
    return [];
  }

  return data || [];
}

/**
 * Get awardee by ID
 */
export async function getAwardeeById(id: string): Promise<any> {
  const { data, error } = await supabase
    .from('awardees')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching awardee:', error);
    return null;
  }

  return data;
}

/**
 * Get awardee statistics
 */
export async function getAwardeeStats(): Promise<{
  total: number;
  byBusinessType: Record<string, number>;
  byCategory: Record<string, number>;
  byLocation: Record<string, number>;
  femaleOwned: number;
}> {
  const { data: awardees, error } = await supabase
    .from('awardees')
    .select('business_type, primary_categories, locations, female_owned');

  if (error) {
    console.error('Error fetching awardee stats:', error);
    return {
      total: 0,
      byBusinessType: {},
      byCategory: {},
      byLocation: {},
      femaleOwned: 0
    };
  }

  const stats = {
    total: awardees?.length || 0,
    byBusinessType: {} as Record<string, number>,
    byCategory: {} as Record<string, number>,
    byLocation: {} as Record<string, number>,
    femaleOwned: 0
  };

  awardees?.forEach(awardee => {
    // Business type stats
    if (awardee.business_type) {
      stats.byBusinessType[awardee.business_type] = (stats.byBusinessType[awardee.business_type] || 0) + 1;
    }

    // Category stats
    if (awardee.primary_categories) {
      awardee.primary_categories.forEach((category: string) => {
        stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
      });
    }

    // Location stats
    if (awardee.locations) {
      awardee.locations.forEach((location: string) => {
        stats.byLocation[location] = (stats.byLocation[location] || 0) + 1;
      });
    }

    // Female owned stats
    if (awardee.female_owned) {
      stats.femaleOwned++;
    }
  });

  return stats;
}
