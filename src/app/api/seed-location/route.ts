import { NextRequest, NextResponse } from 'next/server'
import { seedLocationData } from '@/src/lib/data-sources/data-aggregator'

export async function POST(request: NextRequest) {
  try {
    const { latitude, longitude } = await request.json()

    if (!latitude || !longitude) {
      return NextResponse.json(
        { error: 'Latitude and longitude are required' },
        { status: 400 }
      )
    }

    console.log(`Seeding data for location: ${latitude}, ${longitude}`)

    // Use the dynamic data aggregator to fetch real data from:
    // - OpenStreetMap (POIs, restaurants, parks, etc.)
    // - Police UK API (crime data, neighbourhood events)
    // - Postcodes.io (location info)
    const result = await seedLocationData(latitude, longitude)

    console.log(`Seeded ${result.documentsCreated} documents for ${result.neighbourhood}`)

    return NextResponse.json({
      success: true,
      documentsCreated: result.documentsCreated,
      neighbourhood: result.neighbourhood,
      categories: result.categories,
    })
  } catch (error) {
    console.error('Seed location error:', error)
    return NextResponse.json(
      { error: String(error) },
      { status: 500 }
    )
  }
}
