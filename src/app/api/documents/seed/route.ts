import { NextResponse } from 'next/server'
import { addDocument } from '@/src/lib/langchain/embeddings'

// Sample community data - replace with real data for production
const SAMPLE_DOCUMENTS = [
  {
    title: "Weekly Farmers Market",
    content: "Fresh local produce every Saturday 9am-2pm at Central Square. Features organic vegetables, artisan bread, local honey, and seasonal fruits. Live music and family-friendly atmosphere.",
    category: "event",
    neighbourhood: "Guildford"
  },
  {
    title: "Community Garden Volunteers Needed",
    content: "Join our community garden project! We're looking for volunteers to help maintain our shared growing spaces. No experience needed - we provide tools and training. Meet every Sunday at 10am.",
    category: "announcement",
    neighbourhood: "Guildford"
  },
  {
    title: "Joe's Coffee House",
    content: "Independent coffee shop serving specialty coffee and homemade pastries. Free WiFi, dog-friendly outdoor seating. Open Mon-Sat 7am-6pm. Student discount available with valid ID.",
    category: "business",
    neighbourhood: "Guildford"
  },
  {
    title: "Free Legal Advice Clinic",
    content: "Citizens Advice Bureau offers free 30-minute legal consultations every Wednesday 2-5pm at the Community Centre. Topics include housing, employment, and family law. Book in advance.",
    category: "service",
    neighbourhood: "Guildford"
  },
  {
    title: "Youth Football Club",
    content: "Accepting new players ages 6-16. Training sessions Tuesday and Thursday evenings at Stoke Park. All skill levels welcome. Season runs September to May. Registration fee £50.",
    category: "service",
    neighbourhood: "Guildford"
  },
]

export async function POST() {
  try {
    const results = []
    
    for (const doc of SAMPLE_DOCUMENTS) {
      const result = await addDocument(
        doc.title,
        doc.content,
        doc.category,
        doc.neighbourhood
      )
      results.push(result)
    }

    return NextResponse.json({ 
      message: 'Seeded successfully',
      count: results.length 
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: 'Failed to seed documents' },
      { status: 500 }
    )
  }
}