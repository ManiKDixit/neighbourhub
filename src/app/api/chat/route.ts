/*import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/src/lib/supabase/client'
import { runAgent, AgentMessage } from '@/src/lib/langchain/agent'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { message, conversationId, neighbourhood } = await request.json()

    // Get existing conversation or create new
    let chatHistory: AgentMessage[] = []
    
    if (conversationId) {
      const { data: conversation } = await supabase
        .from('conversations')
        .select('messages')
        .eq('id', conversationId)
        .single()
      
      if (conversation) {
        chatHistory = conversation.messages as AgentMessage[]
      }
    }

    // Run the agent
    const result = await runAgent(message, neighbourhood, chatHistory)

    // Update conversation history
    const newHistory = [
      ...chatHistory,
      { role: 'user' as const, content: message },
      { role: 'assistant' as const, content: result.response },
    ]

    if (conversationId) {
      await supabase
        .from('conversations')
        .update({ 
          messages: newHistory,
          updated_at: new Date().toISOString(),
        })
        .eq('id', conversationId)
    } else {
      await supabase
        .from('conversations')
        .insert({
          user_id: user.id,
          messages: newHistory,
        })
    }

    return NextResponse.json({
      response: result.response,
      sources: result.sources,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} */


/*import { NextRequest, NextResponse } from 'next/server'
import { runAgent } from '@/src/lib/langchain/agent'

export async function POST(request: NextRequest) {
  try {
    const { message, neighbourhood } = await request.json()

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    // Run the agent
    const result = await runAgent(message, neighbourhood || 'Unknown', [])

    return NextResponse.json({
      response: result.response,
      sources: result.sources,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} */

  import { NextRequest, NextResponse } from 'next/server'
import { runAgent } from '@/src/lib/langchain/agent'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { message, neighbourhood } = body

    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 })
    }

    console.log('Chat request:', { message, neighbourhood })

    const result = await runAgent(message, neighbourhood || 'Unknown', [])

    console.log('Chat response:', result)

    return NextResponse.json({
      response: result.response,
      sources: result.sources,
    })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'Something went wrong', details: String(error) },
      { status: 500 }
    )
  }
}