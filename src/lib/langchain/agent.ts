// import { ChatGoogleGenerativeAI } from '@langchain/google-genai'

// const model = new ChatGoogleGenerativeAI({
//   apiKey: process.env.GOOGLE_API_KEY || '',
//   model:  'gemini-2.0-flash-lite',
//   maxOutputTokens: 1500,
//   temperature: 0.7,
// })

// export interface AgentMessage {
//   role: 'user' | 'assistant'
//   content: string
// }

// // Map user queries to relevant search terms
// function extractSearchTerms(input: string): string[] {
//   const lowered = input.toLowerCase()
//   const terms: string[] = []
  
//   // Food & Drink
//   if (lowered.includes('cafe') || lowered.includes('coffee') || lowered.includes('breakfast')) {
//     terms.push('cafe', 'coffee')
//   }
//   if (lowered.includes('restaurant') || lowered.includes('food') || lowered.includes('eat') || lowered.includes('dinner') || lowered.includes('lunch')) {
//     terms.push('restaurant', 'food')
//   }
//   if (lowered.includes('pub') || lowered.includes('bar') || lowered.includes('drink')) {
//     terms.push('pub', 'bar')
//   }
  
//   // Leisure
//   if (lowered.includes('park') || lowered.includes('green') || lowered.includes('outdoor') || lowered.includes('nature')) {
//     terms.push('park', 'garden', 'playground')
//   }
  
//   // Services
//   if (lowered.includes('shop') || lowered.includes('store') || lowered.includes('buy') || lowered.includes('supermarket')) {
//     terms.push('shop', 'supermarket', 'store')
//   }
//   if (lowered.includes('doctor') || lowered.includes('pharmacy') || lowered.includes('health') || lowered.includes('hospital')) {
//     terms.push('pharmacy', 'doctor', 'health')
//   }
//   if (lowered.includes('bank') || lowered.includes('post office') || lowered.includes('library')) {
//     terms.push('bank', 'library', 'post office')
//   }
  
//   // Safety
//   if (lowered.includes('safe') || lowered.includes('crime') || lowered.includes('security')) {
//     terms.push('crime', 'safety', 'police')
//   }
  
//   // Events
//   if (lowered.includes('event') || lowered.includes('happening') || lowered.includes('activity') || lowered.includes('things to do')) {
//     terms.push('event', 'community')
//   }
  
//   // Overview
//   if (lowered.includes('about') || lowered.includes('overview') || lowered.includes('tell me about') || lowered.includes('what is')) {
//     terms.push('overview')
//   }
  
//   // If no specific terms found, use the original input
//   if (terms.length === 0) {
//     terms.push(input)
//   }
  
//   return terms
// }

// export async function runAgent(
//   input: string,
//   neighbourhood: string,
//   chatHistory: AgentMessage[] = []
// ) {
//   let allDocs: any[] = []
  
//   try {
//     const { searchDocuments } = await import('./embeddings')
    
//     // Extract relevant search terms from user query
//     const searchTerms = extractSearchTerms(input)
//     console.log(`User query: "${input}"`)
//     console.log(`Search terms: ${searchTerms.join(', ')}`)
    
//     // Search for each term and combine results
//     const seenIds = new Set<string>()
    
//     for (const term of searchTerms) {
//       console.log(`Searching for: "${term}" in "${neighbourhood}"`)
      
//       // Search with neighbourhood filter
//       let docs = await searchDocuments(term, neighbourhood, 5)
      
//       // If no results, try without neighbourhood filter
//       if (!docs || docs.length === 0) {
//         docs = await searchDocuments(term, null, 5)
//       }
      
//       // Add unique documents
//       if (docs && docs.length > 0) {
//         for (const doc of docs) {
//           const docId = doc.id || doc.title
//           if (!seenIds.has(docId)) {
//             seenIds.add(docId)
//             allDocs.push(doc)
//           }
//         }
//       }
//     }
    
//     console.log(`Total unique documents found: ${allDocs.length}`)
    
//     // Log what we found
//     if (allDocs.length > 0) {
//       console.log('Documents found:')
//       allDocs.slice(0, 5).forEach(doc => {
//         console.log(`  - [${doc.category}] ${doc.title}`)
//       })
//     }
    
//   } catch (error) {
//     console.error('Search failed:', error)
//   }

//   // Build context from documents
//   let context = 'No local information found in the database for this query.'
  
//   if (allDocs.length > 0) {
//     // Limit to top 10 most relevant documents
//     const topDocs = allDocs.slice(0, 10)
//     context = topDocs.map(doc => 
//       `• ${doc.title}: ${doc.content}`
//     ).join('\n\n')
//   }

//   const prompt = `You are NeighbourHub, a helpful local community assistant for ${neighbourhood}.

// ===== LOCAL DATABASE RESULTS =====
// ${context}
// ===================================

// USER QUESTION: ${input}

// INSTRUCTIONS:
// 1. If the LOCAL DATABASE RESULTS above contain relevant places/information, list them with specific names and details
// 2. Format your response with the actual names and descriptions from the database
// 3. If the database has cafes, restaurants, parks, etc. - LIST THEM BY NAME
// 4. Be concise and friendly
// 5. If no relevant results were found, apologize and suggest the user try "Load local data" to refresh

// DO NOT make up places that aren't in the database results above.`

//   try {
//     const response = await model.invoke(prompt)
//     return {
//       response: response.content as string,
//       sources: allDocs.slice(0, 5).map(d => ({ title: d.title, category: d.category })),
//     }
//   } catch (error) {
//     console.error('Gemini error:', error)
//     return {
//       response: "I'm having trouble connecting right now. Please try again.",
//       sources: [],
//     }
//   }
// }



import Groq from 'groq-sdk'

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
})

export interface AgentMessage {
  role: 'user' | 'assistant'
  content: string
}

function extractSearchTerms(input: string): string[] {
  const lowered = input.toLowerCase()
  const terms: string[] = []
  
  if (lowered.includes('cafe') || lowered.includes('coffee') || lowered.includes('breakfast')) {
    terms.push('cafe', 'coffee')
  }
  if (lowered.includes('restaurant') || lowered.includes('food') || lowered.includes('eat') || lowered.includes('dinner') || lowered.includes('lunch')) {
    terms.push('restaurant', 'food')
  }
  if (lowered.includes('pub') || lowered.includes('bar') || lowered.includes('drink') || lowered.includes('beer')) {
    terms.push('pub', 'bar')
  }
  if (lowered.includes('park') || lowered.includes('green') || lowered.includes('outdoor') || lowered.includes('walk')) {
    terms.push('park', 'garden')
  }
  if (lowered.includes('shop') || lowered.includes('store') || lowered.includes('supermarket') || lowered.includes('buy')) {
    terms.push('shop', 'supermarket')
  }
  if (lowered.includes('safe') || lowered.includes('crime') || lowered.includes('danger') || lowered.includes('security')) {
    terms.push('crime', 'safety')
  }
  if (lowered.includes('health') || lowered.includes('doctor') || lowered.includes('pharmacy') || lowered.includes('hospital')) {
    terms.push('health', 'pharmacy')
  }
  
  if (terms.length === 0) {
    terms.push(input)
  }
  
  return terms
}

export async function runAgent(
  input: string,
  neighbourhood: string,
  chatHistory: AgentMessage[] = []
) {
  let allDocs: any[] = []
  
  try {
    const { searchDocuments } = await import('./embeddings')
    const searchTerms = extractSearchTerms(input)
    console.log(`User query: "${input}"`)
    console.log(`Search terms: ${searchTerms.join(', ')}`)
    
    // Use title as unique key to prevent duplicates
    const seenTitles = new Set<string>()
    
    for (const term of searchTerms) {
      console.log(`Searching for: "${term}" in "${neighbourhood}"`)
      let docs = await searchDocuments(term, neighbourhood, 10)
      
      if (!docs || docs.length === 0) {
        docs = await searchDocuments(term, null, 10)
      }
      
      if (docs) {
        for (const doc of docs) {
          // Deduplicate by title
          if (!seenTitles.has(doc.title)) {
            seenTitles.add(doc.title)
            allDocs.push(doc)
          }
        }
      }
    }
    
    console.log(`Total unique documents found: ${allDocs.length}`)
    
  } catch (error) {
    console.error('Search failed:', error)
  }

  // Build context from UNIQUE documents only
  let context = 'No local information found.'
  if (allDocs.length > 0) {
    context = allDocs.slice(0, 15).map(doc => `• ${doc.title} (${doc.category}): ${doc.content}`).join('\n\n')
  }

  const prompt = `You are NeighbourHub, a friendly local assistant for ${neighbourhood}.

LOCAL PLACES DATABASE:
${context}

USER QUESTION: ${input}

INSTRUCTIONS:
- List ONLY the unique places from the database above (no duplicates)
- Be concise and helpful
- Group by category if relevant (cafes, restaurants, etc.)`

  try {
    const response = await groq.chat.completions.create({
      messages: [{ role: 'user', content: prompt }],
      model: 'llama-3.1-8b-instant',
      temperature: 0.7,
      max_tokens: 1000,
    })
    
    // Deduplicate sources
    const uniqueSources = allDocs
      .slice(0, 5)
      .map(d => ({ title: d.title, category: d.category }))
    
    return {
      response: response.choices[0]?.message?.content || "Sorry, I couldn't generate a response.",
      sources: uniqueSources,
    }
  } catch (error) {
    console.error('Groq error:', error)
    return {
      response: "I'm having trouble connecting right now. Please try again.",
      sources: [],
    }
  }
}