/*import { NextResponse } from 'next/server'
import { addDocument } from '@/src/lib/langchain/embeddings'

const SAMPLE_DOCUMENTS = [
  {
    title: "Guildford Farmers Market",
    content: "Weekly farmers market every Saturday 9am-2pm in Guildford High Street. Fresh local produce, artisan breads, organic vegetables, local honey, and homemade jams. Family-friendly atmosphere with live music.",
    category: "event",
    neighbourhood: "Guildford"
  },
  {
    title: "Stoke Park",
    content: "Beautiful 30-acre public park featuring Japanese garden, playground, skateboard area, tennis courts, and bowling green. Open dawn to dusk. Free entry. Popular for picnics and community events.",
    category: "leisure",
    neighbourhood: "Guildford"
  },
  {
    title: "The Boileroom",
    content: "Independent live music venue on Stoke Road. Regular gigs featuring local and touring bands, comedy nights, quiz nights, and community events. Check website for upcoming listings. Bar and food available.",
    category: "entertainment",
    neighbourhood: "Guildford"
  },
  {
    title: "Guildford Library",
    content: "Central library offering free book lending, computer access, printing services, and free WiFi. Regular events include reading groups, children's story time, and digital skills workshops. Open Monday to Saturday.",
    category: "service",
    neighbourhood: "Guildford"
  },
  {
    title: "Guildford Lido",
    content: "Historic outdoor swimming pool open May to September. 50-metre heated pool, splash area for children, sunbathing terrace, and café. Swimming lessons and aqua aerobics available.",
    category: "leisure",
    neighbourhood: "Guildford"
  },
  {
    title: "Holy Trinity Church Community Café",
    content: "Welcoming community café in the town centre. Affordable hot drinks, homemade cakes, and light lunches. Open weekdays 10am-2pm. All welcome, great place to meet neighbours.",
    category: "community",
    neighbourhood: "Guildford"
  },
  {
    title: "Guildford Volunteer Centre",
    content: "Connect with local volunteering opportunities. Roles available in charity shops, befriending services, environmental projects, and community events. Training provided for all volunteers.",
    category: "service",
    neighbourhood: "Guildford"
  },
  {
    title: "Friday Night Food Market",
    content: "Street food market every Friday 5-9pm at the Castle Grounds. International cuisines, craft beers, and live entertainment. Family-friendly with seating areas.",
    category: "event",
    neighbourhood: "Guildford"
  }
]

export async function POST() {
  try {
    const results = []
    
    for (const doc of SAMPLE_DOCUMENTS) {
      console.log(`Adding document: ${doc.title}`)
      const result = await addDocument(
        doc.title,
        doc.content,
        doc.category,
        doc.neighbourhood
      )
      results.push(result)
    }

    return NextResponse.json({ 
      success: true,
      message: `Seeded ${results.length} documents`,
      documents: results.map(r => r?.title)
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
} */

  import { NextResponse } from 'next/server'
import { addDocument } from '@/src/lib/langchain/embeddings'

const SAMPLE_DOCUMENTS = [
  {
    title: "Guildford Farmers Market",
    content: "Weekly farmers market every Saturday 9am-2pm in Guildford High Street. Fresh local produce, artisan breads, organic vegetables, local honey, and homemade jams.",
    category: "event",
    neighbourhood: "Guildford"
  },
  {
    title: "Guildford Lido",
    content: "Historic outdoor swimming pool open May to September. 50-metre heated pool, children's splash area, sunbathing terrace, and café. Swimming lessons available.",
    category: "leisure",
    neighbourhood: "Guildford"
  },
  {
    title: "Stoke Park",
    content: "Beautiful 30-acre public park with Japanese garden, playground, skateboard area, tennis courts, and bowling green. Open dawn to dusk. Free entry.",
    category: "leisure",
    neighbourhood: "Guildford"
  },
  {
    title: "Guildford Volunteer Centre",
    content: "Connect with local volunteering opportunities. Roles in charity shops, befriending services, environmental projects, and community events. Training provided.",
    category: "service",
    neighbourhood: "Guildford"
  },
  {
    title: "Friday Night Food Market",
    content: "Street food market every Friday 5-9pm at Castle Grounds. International cuisines, craft beers, and live entertainment. Family-friendly.",
    category: "event",
    neighbourhood: "Guildford"
  },
  {
    title: "Guildford Spectrum",
    content: "Large leisure centre with Olympic-sized ice rink, swimming pools, gym, bowling alley, and soft play area. Open daily from 6am.",
    category: "leisure",
    neighbourhood: "Guildford"
  }
]

export async function POST() {
  try {
    const results = []
    
    for (const doc of SAMPLE_DOCUMENTS) {
      console.log(`Seeding: ${doc.title}`)
      const result = await addDocument(
        doc.title,
        doc.content,
        doc.category,
        doc.neighbourhood
      )
      results.push(doc.title)
    }

    return NextResponse.json({ 
      success: true,
      seeded: results.length,
      documents: results
    })
  } catch (error) {
    console.error('Seed error:', error)
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}