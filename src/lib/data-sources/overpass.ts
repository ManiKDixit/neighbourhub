/**
 * POI Data Fetcher
 * Uses multiple free APIs with fallbacks:
 * 1. OpenTripMap (most reliable)
 * 2. Overpass API (backup)
 */

export interface POI {
  id: string | number
  name: string
  category: string
  subcategory: string
  latitude: number
  longitude: number
  tags: Record<string, string>
}

// OpenTripMap category mappings
const OTM_CATEGORIES: Record<string, { kinds: string; category: string }> = {
  food: { kinds: 'restaurants,cafes,pubs,bars,fast_food', category: 'food' },
  shops: { kinds: 'shops,supermarkets,malls', category: 'shopping' },
  leisure: { kinds: 'parks,gardens,sport', category: 'leisure' },
  culture: { kinds: 'museums,theatres,cinemas', category: 'culture' },
  health: { kinds: 'hospitals,pharmacies,clinics', category: 'health' },
}

/**
 * Fetch POIs from OpenTripMap (free, no API key required for limited use)
 */
async function fetchFromOpenTripMap(
  lat: number,
  lng: number,
  radius: number,
  kinds: string
): Promise<POI[]> {
  try {
    // OpenTripMap free tier - no API key needed for basic requests
    const url = `https://api.opentripmap.com/0.1/en/places/radius?radius=${radius}&lon=${lng}&lat=${lat}&kinds=${kinds}&limit=25&format=json`
    
    console.log(`OpenTripMap: Fetching ${kinds}...`)
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'NeighbourHub/1.0',
      },
    })
    
    if (!response.ok) {
      console.log(`OpenTripMap returned ${response.status}`)
      return []
    }
    
    const data = await response.json()
    
    if (!Array.isArray(data)) {
      return []
    }
    
    return data
      .filter((item: any) => item.name && item.name.trim() !== '')
      .map((item: any) => ({
        id: item.xid || item.osm,
        name: item.name,
        category: kinds.split(',')[0],
        subcategory: item.kinds?.split(',')[0]?.replace(/_/g, ' ') || 'place',
        latitude: item.point?.lat || lat,
        longitude: item.point?.lon || lng,
        tags: { kinds: item.kinds || '' },
      }))
      
  } catch (error) {
    console.error('OpenTripMap error:', error)
    return []
  }
}

/**
 * Fetch from Overpass as backup
 */
async function fetchFromOverpass(
  lat: number,
  lng: number,
  radius: number,
  amenityTypes: string
): Promise<POI[]> {
  try {
    const query = `[out:json][timeout:25];
node["amenity"~"${amenityTypes}"](around:${radius},${lat},${lng});
out body;`

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'NeighbourHub/1.0',
      },
      body: `data=${encodeURIComponent(query)}`,
    })
    
    if (!response.ok) {
      return []
    }
    
    const data = await response.json()
    
    return (data.elements || [])
      .filter((el: any) => el.tags?.name)
      .map((el: any) => ({
        id: el.id,
        name: el.tags.name,
        category: 'food',
        subcategory: el.tags.amenity?.replace(/_/g, ' ') || 'place',
        latitude: el.lat,
        longitude: el.lon,
        tags: el.tags || {},
      }))
      
  } catch (error) {
    console.error('Overpass error:', error)
    return []
  }
}

/**
 * Main function: Get all POIs near a location
 */
export async function getPOIsNearLocation(
  lat: number,
  lng: number,
  radiusMetres: number = 1500
): Promise<POI[]> {
  console.log(`Fetching POIs near ${lat}, ${lng}...`)
  
  const allPOIs: POI[] = []
  
  // Try OpenTripMap first (more reliable)
  for (const [name, config] of Object.entries(OTM_CATEGORIES)) {
    console.log(`Fetching ${name}...`)
    const pois = await fetchFromOpenTripMap(lat, lng, radiusMetres, config.kinds)
    
    // Update category
    pois.forEach(poi => poi.category = config.category)
    allPOIs.push(...pois)
    
    // Small delay between requests
    await new Promise(r => setTimeout(r, 300))
  }
  
  console.log(`OpenTripMap found ${allPOIs.length} places`)
  
  // If OpenTripMap didn't return enough, try Overpass
  if (allPOIs.length < 10) {
    console.log('Trying Overpass as backup...')
    const overpassPOIs = await fetchFromOverpass(lat, lng, radiusMetres, 'restaurant|cafe|pub|fast_food')
    allPOIs.push(...overpassPOIs)
  }
  
  console.log(`Total POIs: ${allPOIs.length}`)
  return allPOIs
}

/**
 * Get parks specifically
 */
export async function getParksNearLocation(
  lat: number,
  lng: number,
  radiusMetres: number = 2000
): Promise<POI[]> {
  return fetchFromOpenTripMap(lat, lng, radiusMetres, 'parks,gardens,natural')
}

/**
 * Format POI for embedding/storage
 */
export function formatPOIForEmbedding(poi: POI): string {
  return `${poi.name} is a ${poi.subcategory} in the area.`
}