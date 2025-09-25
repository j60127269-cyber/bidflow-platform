import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Create a Supabase client with service role key to bypass RLS
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Function to calculate similarity between two strings
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();
  
  if (s1 === s2) return 1.0;
  
  // Levenshtein distance algorithm
  const matrix = Array(s2.length + 1).fill(null).map(() => Array(s1.length + 1).fill(null));
  
  for (let i = 0; i <= s1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= s2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= s2.length; j++) {
    for (let i = 1; i <= s1.length; i++) {
      const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  const maxLength = Math.max(s1.length, s2.length);
  return maxLength === 0 ? 1.0 : (maxLength - matrix[s2.length][s1.length]) / maxLength;
}

// Function to normalize entity name for comparison
function normalizeEntityName(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize spaces
    .trim();
}

export async function POST(request: NextRequest) {
  try {
    const { entityName, threshold = 0.8 } = await request.json();
    
    if (!entityName || typeof entityName !== 'string') {
      return NextResponse.json({ 
        error: 'Entity name is required' 
      }, { status: 400 });
    }

    // Fetch all existing procuring entities
    const { data: existingEntities, error } = await supabase
      .from('procuring_entities')
      .select('id, entity_name, entity_type, country, website')
      .order('entity_name', { ascending: true });

    if (error) {
      console.error('Error fetching existing entities:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch existing entities', 
        details: error 
      }, { status: 500 });
    }

    const normalizedInput = normalizeEntityName(entityName);
    const potentialDuplicates = [];
    const exactMatches = [];

    // Check for potential duplicates
    for (const entity of existingEntities || []) {
      const normalizedExisting = normalizeEntityName(entity.entity_name);
      const similarity = calculateSimilarity(normalizedInput, normalizedExisting);
      
      if (similarity >= threshold) {
        potentialDuplicates.push({
          ...entity,
          similarity,
          normalized_name: normalizedExisting
        });
      }
      
      if (normalizedInput === normalizedExisting) {
        exactMatches.push(entity);
      }
    }

    // Sort by similarity (highest first)
    potentialDuplicates.sort((a, b) => b.similarity - a.similarity);

    return NextResponse.json({ 
      success: true,
      input: {
        original: entityName,
        normalized: normalizedInput
      },
      validation: {
        isUnique: potentialDuplicates.length === 0,
        hasExactMatch: exactMatches.length > 0,
        potentialDuplicates: potentialDuplicates.slice(0, 5), // Top 5 most similar
        exactMatches,
        recommendation: potentialDuplicates.length > 0 
          ? `Found ${potentialDuplicates.length} similar entities. Consider using existing entity: "${potentialDuplicates[0].entity_name}"`
          : 'Entity name appears to be unique'
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
