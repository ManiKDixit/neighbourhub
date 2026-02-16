export interface POI {
  id: number
  type: 'node' | 'way' | 'relation'
  name: string
  category: string
  subcategory: string
  latitude: number
  longitude: number
  tags: Record<string, string>
}

// Common amenity types to query
const AMENITY_CATEGORIES = {
  food: ['restaurant', 'cafe', 'pub', 'fast_food', 'bar'],
  health: ['pharmacy', 'doctors', 'dentist', 'hospital', 'clinic'],
  shopping: ['supermarket', 'convenience', 'bakery', 'butcher'],
  services: ['bank', 'post_office', 'library', 'community_centre'],
  education: ['school', 'kindergarten', 'college', 'university'],
  leisure: ['park', 'playground', 'sports_centre', 'swimming_pool'],
  transport: ['bus_station', 'parking', 'fuel', 'bicycle_rental'],
}

/**
 * Query Overpass API
 */
async function queryOverpass(query: string): Promise<any> {
  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `data=${encodeURIComponent(query)}`,
  })
  
  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status}`)
  }
  
  return response.json()
}

/**
 * Get POIs near a location by category
 * @param lat Latitude
 * @param lng Longitude
 * @param radiusMetres Search radius in metres (default 1000m = 1km)
 * @param categories Array of categories to search (e.g., ['food', 'health'])
 */
export async function getPOIsNearLocation(
  lat: number,
  lng: number,
  radiusMetres: number = 1000,
  categories?: (keyof typeof AMENITY_CATEGORIES)[]
): Promise<POI[]> {
  try {
    // Build amenity list
    const selectedCategories = categories || Object.keys(AMENITY_CATEGORIES) as (keyof typeof AMENITY_CATEGORIES)[]
    const amenities = selectedCategories.flatMap(cat => AMENITY_CATEGORIES[cat])
    
    // Overpass QL query - search for nodes and ways with these amenities
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"~"${amenities.join('|')}"](around:${radiusMetres},${lat},${lng});
        way["amenity"~"${amenities.join('|')}"](around:${radiusMetres},${lat},${lng});
        node["shop"](around:${radiusMetres},${lat},${lng});
        way["shop"](around:${radiusMetres},${lat},${lng});
      );
      out center;
    `
    
    const data = await queryOverpass(query)
    
    return data.elements
      .filter((el: any) => el.tags?.name) // Only include named places
      .map((el: any) => {
        const amenity = el.tags.amenity || el.tags.shop || 'unknown'
        const category = findCategory(amenity)
        
        return {
          id: el.id,
          type: el.type,
          name: el.tags.name,
          category,
          subcategory: amenity.replace(/_/g, ' '),
          latitude: el.lat || el.center?.lat,
          longitude: el.lon || el.center?.lon,
          tags: el.tags,
        }
      })
  } catch (error) {
    console.error('Overpass query failed:', error)
    return []
  }
}

/**
 * Find which category an amenity belongs to
 */
function findCategory(amenity: string): string {
  for (const [category, amenities] of Object.entries(AMENITY_CATEGORIES)) {
    if (amenities.includes(amenity)) return category
  }
  return 'other'
}

/**
 * Get specific type of POI (e.g., all cafes)
 */
export async function getSpecificPOIs(
  lat: number,
  lng: number,
  amenityType: string,
  radiusMetres: number = 1000
): Promise<POI[]> {
  try {
    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="${amenityType}"](around:${radiusMetres},${lat},${lng});
        way["amenity"="${amenityType}"](around:${radiusMetres},${lat},${lng});
      );
      out center;
    `
    
    const data = await queryOverpass(query)
    
    return data.elements
      .filter((el: any) => el.tags?.name)
      .map((el: any) => ({
        id: el.id,
        type: el.type,
        name: el.tags.name,
        category: findCategory(amenityType),
        subcategory: amenityType.replace(/_/g, ' '),
        latitude: el.lat || el.center?.lat,
        longitude: el.lon || el.center?.lon,
        tags: el.tags,
      }))
  } catch (error) {
    console.error('Overpass query failed:', error)
    return []
  }
}

/**
 * Get parks and green spaces
 */
export async function getParksNearLocation(
  lat: number,
  lng: number,
  radiusMetres: number = 2000
): Promise<POI[]> {
  try {
    const query = `
      [out:json][timeout:25];
      (
        way["leisure"="park"](around:${radiusMetres},${lat},${lng});
        way["leisure"="garden"](around:${radiusMetres},${lat},${lng});
        way["leisure"="playground"](around:${radiusMetres},${lat},${lng});
        relation["leisure"="park"](around:${radiusMetres},${lat},${lng});
      );
      out center;
    `
    
    const data = await queryOverpass(query)
    
    return data.elements
      .filter((el: any) => el.tags?.name)
      .map((el: any) => ({
        id: el.id,
        type: el.type,
        name: el.tags.name,
        category: 'leisure',
        subcategory: el.tags.leisure || 'park',
        latitude: el.center?.lat,
        longitude: el.center?.lon,
        tags: el.tags,
      }))
  } catch (error) {
    console.error('Parks query failed:', error)
    return []
  }
}

/**
 * Format POI data for RAG embedding
 */
export function formatPOIForEmbedding(poi: POI): string {
  const details: string[] = []
  
  // Add opening hours if available
  if (poi.tags.opening_hours) {
    details.push(`Open: ${poi.tags.opening_hours}`)
  }
  
  // Add phone if available
  if (poi.tags.phone || poi.tags['contact:phone']) {
    details.push(`Phone: ${poi.tags.phone || poi.tags['contact:phone']}`)
  }
  
  // Add website if available
  if (poi.tags.website || poi.tags['contact:website']) {
    details.push(`Website: ${poi.tags.website || poi.tags['contact:website']}`)
  }
  
  // Add cuisine for restaurants
  if (poi.tags.cuisine) {
    details.push(`Cuisine: ${poi.tags.cuisine.replace(/;/g, ', ')}`)
  }
  
  // Add wheelchair accessibility
  if (poi.tags.wheelchair === 'yes') {
    details.push('Wheelchair accessible')
  }
  
  const detailsStr = details.length > 0 ? ` ${details.join('. ')}.` : ''
  
  return `${poi.name} is a ${poi.subcategory} in the area.${detailsStr}`
}