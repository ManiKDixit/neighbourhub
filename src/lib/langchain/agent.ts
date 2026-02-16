/*import { ChatGoogleGenerativeAI } from '@langchain/google-genai'
import { searchDocuments } from './embeddings'

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY || '',
  model: 'gemini-pro',
  maxOutputTokens: 1000,
  temperature: 0.7,
})

export interface AgentMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function runAgent(
  input: string,
  neighbourhood: string,
  chatHistory: AgentMessage[] = []
) {
  try {
    // 1. Search for relevant documents
    console.log(`Searching for documents about "${input}" in ${neighbourhood}...`)
    const docs = await searchDocuments(input, neighbourhood, 5)
    
    console.log(`Found ${docs.length} relevant documents`)
    
    // 2. Build context from found documents
    let context = ''
    if (docs.length > 0) {
      context = docs.map(doc => 
        `[${doc.category?.toUpperCase() || 'INFO'}] ${doc.title}: ${doc.content}`
      ).join('\n\n')
    } else {
      context = 'No specific local information found in the database.'
    }

    // 3. Create prompt with context
    const prompt = `You are NeighbourHub, a friendly AI assistant helping people discover their local community in ${neighbourhood}.

IMPORTANT: Use the following LOCAL INFORMATION to answer the user's question. If the information is relevant, reference it specifically. If no relevant information is found, provide general helpful guidance.

LOCAL INFORMATION:
${context}

USER QUESTION: ${input}

Provide a helpful, warm response. If you found relevant local information above, mention specific details like names, times, and locations. Keep your response concise and friendly.`

    // 4. Get response from Gemini
    const response = await model.invoke(prompt)
    
    return {
      response: response.content as string,
      sources: docs.map(d => ({ title: d.title, category: d.category })),
    }
  } catch (error) {
    console.error('Agent error:', error)
    
    return {
      response: "I'm having trouble connecting right now. Please try again in a moment.",
      sources: [],
    }
  }
} */

  /*import { ChatGoogleGenerativeAI } from '@langchain/google-genai'

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY || '',
  model: 'gemini-2.5-flash',
  maxOutputTokens: 1000,
  temperature: 0.7,
})

export interface AgentMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function runAgent(
  input: string,
  neighbourhood: string,
  chatHistory: AgentMessage[] = []
) {
  let context = 'No specific local information available.'
  
  // Try to search documents, but don't crash if it fails
  try {
    const { searchDocuments } = await import('./embeddings')
    const docs = await searchDocuments(input, neighbourhood, 5)
    
    if (docs && docs.length > 0) {
      context = docs.map(doc => 
        `[${doc.category?.toUpperCase() || 'INFO'}] ${doc.title}: ${doc.content}`
      ).join('\n\n')
      console.log(`Found ${docs.length} documents`)
    }
  } catch (error) {
    console.error('Search failed, using fallback:', error)
  }

  const prompt = `You are NeighbourHub, a friendly AI assistant helping people discover their local community in ${neighbourhood}.

LOCAL INFORMATION:
${context}

USER QUESTION: ${input}

Provide a helpful, warm response. If you have specific local information, mention it. Keep your response concise and friendly.`

  try {
    const response = await model.invoke(prompt)
    return {
      response: response.content as string,
      sources: [],
    }
  } catch (error) {
    console.error('Gemini error:', error)
    return {
      response: "I'm having trouble connecting right now. Please try again.",
      sources: [],
    }
  }
} */

  import { ChatGoogleGenerativeAI } from '@langchain/google-genai'

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_API_KEY || '',
  model: 'gemini-2.5-flash',
  maxOutputTokens: 1000,
  temperature: 0.7,
})

export interface AgentMessage {
  role: 'user' | 'assistant'
  content: string
}

export async function runAgent(
  input: string,
  neighbourhood: string,
  chatHistory: AgentMessage[] = []
) {
  let context = 'No specific local information available.'
  let foundDocs: any[] = []
  
  // Try to search documents
  try {
    const { searchDocuments } = await import('./embeddings')
    
    // Try with full neighbourhood name first
    console.log(`Searching for: "${input}" in "${neighbourhood}"`)
    foundDocs = await searchDocuments(input, neighbourhood, 5)
    
    // If no results, try without neighbourhood filter
    if (!foundDocs || foundDocs.length === 0) {
      console.log('No results with neighbourhood filter, trying without...')
      foundDocs = await searchDocuments(input, null, 5)
    }
    
    console.log(`Found ${foundDocs?.length || 0} documents`)
    
    if (foundDocs && foundDocs.length > 0) {
      context = foundDocs.map(doc => 
        `[${doc.category?.toUpperCase() || 'INFO'}] ${doc.title}: ${doc.content}`
      ).join('\n\n')
      console.log('Context:', context.substring(0, 200) + '...')
    }
  } catch (error) {
    console.error('Search failed:', error)
  }

  const prompt = `You are NeighbourHub, a friendly AI assistant for ${neighbourhood}.

USE THIS LOCAL INFORMATION TO ANSWER (if relevant):
${context}

USER QUESTION: ${input}

INSTRUCTIONS:
- If the local information above contains relevant details, USE THEM in your response
- Mention specific names, times, and places from the local information
- Be friendly and helpful
- If no relevant local info, give general guidance`

  try {
    const response = await model.invoke(prompt)
    return {
      response: response.content as string,
      sources: foundDocs?.map(d => ({ title: d.title, category: d.category })) || [],
    }
  } catch (error) {
    console.error('Gemini error:', error)
    return {
      response: "I'm having trouble connecting right now. Please try again.",
      sources: [],
    }
  }
}