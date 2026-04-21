import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function GET() {
  try {
    // Get count by category
    const { data: allDocs, error } = await supabase
      .from('community_documents')
      .select('id, title, category, neighbourhood, created_at')
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Group by category
    const byCategory: Record<string, number> = {}
    const byNeighbourhood: Record<string, number> = {}
    
    allDocs?.forEach(doc => {
      byCategory[doc.category] = (byCategory[doc.category] || 0) + 1
      byNeighbourhood[doc.neighbourhood] = (byNeighbourhood[doc.neighbourhood] || 0) + 1
    })

    return NextResponse.json({
      totalDocuments: allDocs?.length || 0,
      byCategory,
      byNeighbourhood,
      recentDocuments: allDocs?.slice(0, 20).map(d => ({
        title: d.title,
        category: d.category,
        neighbourhood: d.neighbourhood,
      })),
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
