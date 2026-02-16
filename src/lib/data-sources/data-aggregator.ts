import { lookupPostcode, reverseGeocode, type PostcodeData } from './postcodes'
import { 
  getCrimeSummary, 
  getNeighbourhoodEvents, 
  formatCrimeDataForEmbedding,
  type CrimeSummary,
  type NeighbourhoodEvent
} from './police-uk'
import { 
  getPOIsNearLocation, 
  getParksNearLocation,
  formatPOIForEmbedding,
  type POI 
} from './overpass'
import { addDocument } from '../langchain/embeddings'

export interface LocationData {
  location: PostcodeData
  pois: POI[]
  parks: POI[]
  crimeSummary: CrimeSummary[]
  events: NeighbourhoodEvent[]
}

export interface SeedResult {
  documentsCreated: number
  neighbourhood: string
  categories: Record<string, number>
}

/**
 * Fetch all data for a location
 */
export async function fetchLocationData(
  lat: number,
  lng: number
): Promise<LocationData | null> {
  // Get location info
  const location = await reverseGeocode(lat, lng)
  if (!location) {
    console.error('Could not determine location')
    return null
  }
  
  console.log(`Fetching data for ${location.admin_district}...`)
  
  // Fetch all data in parallel
  const [pois, parks, crimeSummary, events] = await Promise.all([
    getPOIsNearLocation(lat, lng, 1500),      // 1.5km radius
    getParksNearLocation(lat, lng, 2000),     // 2km radius
    getCrimeSummary(lat, lng),
    getNeighbourhoodEvents(lat, lng),
  ])
  
  return {
    location,
    pois,
    parks,
    crimeSummary,
    events,
  }
}

/**
 * Seed database with location data
 * This creates embeddings and stores in Supabase for RAG
 */
export async function seedLocationData(
  lat: number,
  lng: number
): Promise<SeedResult> {
  const data = await fetchLocationData(lat, lng)
  
  if (!data) {
    throw new Error('Failed to fetch location data')
  }
  
  const neighbourhood = data.location.admin_district
  const categories: Record<string, number> = {}
  let documentsCreated = 0
  
  // 1. Add POI documents
  for (const poi of data.pois) {
    try {
      await addDocument(
        poi.name,
        formatPOIForEmbedding(poi),
        poi.category,
        neighbourhood,
        {
          source: 'openstreetmap',
          latitude: poi.latitude,
          longitude: poi.longitude,
          subcategory: poi.subcategory,
          osm_id: poi.id,
        }
      )
      
      categories[poi.category] = (categories[poi.category] || 0) + 1
      documentsCreated++
    } catch (error) {
      console.error(`Failed to add POI ${poi.name}:`, error)
    }
  }
  
  // 2. Add parks
  for (const park of data.parks) {
    try {
      await addDocument(
        park.name,
        `${park.name} is a ${park.subcategory} in ${neighbourhood}. Great for outdoor activities and relaxation.`,
        'leisure',
        neighbourhood,
        {
          source: 'openstreetmap',
          latitude: park.latitude,
          longitude: park.longitude,
          osm_id: park.id,
        }
      )
      
      categories['leisure'] = (categories['leisure'] || 0) + 1
      documentsCreated++
    } catch (error) {
      console.error(`Failed to add park ${park.name}:`, error)
    }
  }
  
  // 3. Add crime summary as a single document
  if (data.crimeSummary.length > 0) {
    try {
      await addDocument(
        `Crime Summary - ${neighbourhood}`,
        formatCrimeDataForEmbedding(data.crimeSummary, neighbourhood),
        'safety',
        neighbourhood,
        {
          source: 'police_uk',
          crime_data: data.crimeSummary,
        }
      )
      
      categories['safety'] = 1
      documentsCreated++
    } catch (error) {
      console.error('Failed to add crime summary:', error)
    }
  }
  
  // 4. Add neighbourhood events
  for (const event of data.events) {
    try {
      const content = `${event.title}: ${event.description}. ` +
        `Location: ${event.address}. ` +
        `Date: ${new Date(event.start_date).toLocaleDateString('en-GB')}.`
      
      await addDocument(
        event.title,
        content,
        'event',
        neighbourhood,
        {
          source: 'police_uk',
          start_date: event.start_date,
          end_date: event.end_date,
          address: event.address,
        }
      )
      
      categories['event'] = (categories['event'] || 0) + 1
      documentsCreated++
    } catch (error) {
      console.error(`Failed to add event ${event.title}:`, error)
    }
  }
  
  // 5. Add a neighbourhood overview document
  try {
    const overview = generateNeighbourhoodOverview(data)
    await addDocument(
      `${neighbourhood} Overview`,
      overview,
      'overview',
      neighbourhood,
      {
        source: 'aggregated',
        postcode: data.location.postcode,
        region: data.location.region,
      }
    )
    
    categories['overview'] = 1
    documentsCreated++
  } catch (error) {
    console.error('Failed to add neighbourhood overview:', error)
  }
  
  return {
    documentsCreated,
    neighbourhood,
    categories,
  }
}

/**
 * Generate a neighbourhood overview from aggregated data
 */
function generateNeighbourhoodOverview(data: LocationData): string {
  const { location, pois, parks, crimeSummary } = data
  
  // Count POIs by category
  const poiCounts: Record<string, number> = {}
  pois.forEach(poi => {
    poiCounts[poi.category] = (poiCounts[poi.category] || 0) + 1
  })
  
  const parts: string[] = [
    `${location.admin_district} is located in ${location.region}, ${location.country}.`,
  ]
  
  // Add POI summary
  if (pois.length > 0) {
    const highlights = Object.entries(poiCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([cat, count]) => `${count} ${cat} venues`)
      .join(', ')
    
    parts.push(`The area has ${highlights}.`)
  }
  
  // Add parks info
  if (parks.length > 0) {
    const parkNames = parks.slice(0, 3).map(p => p.name).join(', ')
    parts.push(`Green spaces include ${parkNames}.`)
  }
  
  // Add safety info
  if (crimeSummary.length > 0) {
    const total = crimeSummary.reduce((sum, c) => sum + c.count, 0)
    const topCrime = crimeSummary[0]
    parts.push(
      `Recent police data shows ${total} incidents, ` +
      `with ${topCrime.category} being most common (${topCrime.count} cases).`
    )
  }
  
  parts.push(
    `Parliamentary constituency: ${location.parliamentary_constituency}.`
  )
  
  return parts.join(' ')
}

/**
 * Fetch data for a postcode
 */
export async function fetchDataForPostcode(postcode: string): Promise<SeedResult> {
  const location = await lookupPostcode(postcode)
  
  if (!location) {
    throw new Error(`Invalid postcode: ${postcode}`)
  }
  
  return seedLocationData(location.latitude, location.longitude)
}
