import { InferenceClient } from '@huggingface/inference'
import { createClient } from '@supabase/supabase-js'


const hf = new InferenceClient(process.env.HUGGINGFACE_API_KEY)

// Admin client for database operations
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Generate embeddings using HuggingFace (free)
 * Using a smaller model that returns 384 dimensions
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await hf.featureExtraction({
      model: 'sentence-transformers/all-MiniLM-L6-v2',
      inputs: text,
    })
    
    // Response is already an array of numbers
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
  // Generate embedding for the document
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
    const queryEmbedding = await generateEmbedding(query)
    
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: queryEmbedding,
      match_threshold: 0.2,  // Lower threshold for more results
      match_count: limit,
      user_neighbourhood: neighbourhood || null,
    })

    if (error) {
      console.error('Search error:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Search documents error:', error)
    return []
  }
}