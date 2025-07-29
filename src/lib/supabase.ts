import { createClient } from '@supabase/supabase-js'

// Add this at the top of src/lib/supabase.ts for debugging
console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseKey)

// Types for our database - matching the 'summarize' table structure
export interface SummaryRecord {
  id?: number
  created_at?: string
  url: string
  summary: string
}

// Function to save summary to Supabase
export async function saveSummaryToSupabase(
  url: string,
  summary: string
) {
  try {
    const { data, error } = await supabase
      .from('summarize')
      .insert([{ url, summary }])
      .select()
      .single();

    if (error) {
      console.error('Error saving to Supabase:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Failed to save summary to Supabase:', error);
    throw error;
  }
}

// Function to get summaries from Supabase
export async function getSummariesFromSupabase(limit = 10) {
  try {
    const { data, error } = await supabase
      .from('summarize')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching from Supabase:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to fetch summaries from Supabase:', error)
    throw error
  }
}

// Function to check if URL already exists
export async function checkUrlExists(url: string) {
  try {
    const { data, error } = await supabase
      .from('summarize')
      .select('*')
      .eq('url', url)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error checking URL:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('Failed to check URL:', error)
    return null
  }
}
