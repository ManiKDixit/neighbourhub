import { InferenceClient } from '@huggingface/inference'
import { createClient } from '@supabase/supabase-js'

const hf = new InferenceClient(process.env.HUGGINGFACE_API_KEY)

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Generate embeddings using HuggingFace (free)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: text,
    })
    return response as number[]
  } catch (error) {
    console.error('Embedding error:', error)
    throw error
  }
}

/**
 * Add a document with embedding to the database
 */
export async function addDocument(
  title: string,
  content: string,
  category: string,
  neighbourhood: string,
  metadata?: Record<string, unknown>
) {
  const textToEmbed = `${title}\n${content}`
  const embedding = await generateEmbedding(textToEmbed)
  
  const { data, error } = await supabase
    .from('community_documents')
    .insert({
      title,
      content,
      category,
      neighbourhood,
      embedding,
      metadata,
    })
    .select()
    .single()

  if (error) {
    console.error('Insert error:', error)
    throw error
  }
  
  return data
}

/**
 * Search documents by semantic similarity
 */
export async function searchDocuments(
  query: string,
  neighbourhood?: string | null,
  limit: number = 5
): Promise<any[]> {
  try {
    console.log(`[Search] Query: "${query}", Neighbourhood: ${neighbourhood || 'any'}`)
    
    const queryEmbedding = await generateEmbedding(query)
    
    // Try RPC function first
    try {
      const { data, error } = await supabase.rpc('match_documents', {
        query_embedding: queryEmbedding,
        match_threshold: 0.1,  // Very low threshold to get more results
        match_count: limit,
        user_neighbourhood: neighbourhood || null,
      })

      if (error) {
        console.error('[Search] RPC error:', error.message)
        // Fall back to direct query
        return await fallbackSearch(query, neighbourhood, limit)
      }

      console.log(`[Search] RPC returned ${data?.length || 0} results`)
      return data || []
    } catch (rpcError) {
      console.error('[Search] RPC failed, using fallback:', rpcError)
      return await fallbackSearch(query, neighbourhood, limit)
    }
    
  } catch (error) {
    console.error('[Search] Error:', error)
    return []
  }
}

/**
 * Fallback search using direct query (no vector similarity)
 */
async function fallbackSearch(
  query: string,
  neighbourhood?: string | null,
  limit: number = 5
): Promise<any[]> {
  console.log('[Search] Using fallback text search')
  
  let queryBuilder = supabase
    .from('community_documents')
    .select('id, title, content, category, neighbourhood, metadata')
    .limit(limit)
  
  // Filter by neighbourhood if provided
  if (neighbourhood) {
    queryBuilder = queryBuilder.eq('neighbourhood', neighbourhood)
  }
  
  // Try to match by category based on query
  const loweredQuery = query.toLowerCase()
  let categoryFilter: string | null = null
  
  if (loweredQuery.includes('cafe') || loweredQuery.includes('coffee')) {
    categoryFilter = 'food'
  } else if (loweredQuery.includes('restaurant') || loweredQuery.includes('food')) {
    categoryFilter = 'food'
  } else if (loweredQuery.includes('park') || loweredQuery.includes('garden')) {
    categoryFilter = 'leisure'
  } else if (loweredQuery.includes('safe') || loweredQuery.includes('crime')) {
    categoryFilter = 'safety'
  } else if (loweredQuery.includes('event')) {
    categoryFilter = 'event'
  }
  
  if (categoryFilter) {
    queryBuilder = queryBuilder.eq('category', categoryFilter)
  }
  
  const { data, error } = await queryBuilder
  
  if (error) {
    console.error('[Fallback Search] Error:', error)
    return []
  }
  
  console.log(`[Fallback Search] Found ${data?.length || 0} results`)
  return data || []
}

/**
 * Get all documents for a neighbourhood (for debugging)
 */
export async function getAllDocuments(neighbourhood?: string): Promise<any[]> {
  let query = supabase
    .from('community_documents')
    .select('id, title, content, category, neighbourhood')
    .limit(100)
  
  if (neighbourhood) {
    query = query.eq('neighbourhood', neighbourhood)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Get all error:', error)
    return []
  }
  
  return data || []
}
