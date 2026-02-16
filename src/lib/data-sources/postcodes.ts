/**
 * Postcodes.io Integration
 * Free UK postcode lookup API - no auth required
 * Docs: https://postcodes.io/docs
 */

export interface PostcodeData {
  postcode: string
  latitude: number
  longitude: number
  admin_district: string  // e.g., "Guildford"
  admin_ward: string      // e.g., "Stoke"
  region: string          // e.g., "South East"
  country: string
  parliamentary_constituency: string
}

export interface NearestPostcode {
  postcode: string
  distance: number  // metres
  latitude: number
  longitude: number
  admin_district: string
}

/**
 * Lookup a UK postcode
 */
export async function lookupPostcode(postcode: string): Promise<PostcodeData | null> {
  try {
    const cleanPostcode = postcode.replace(/\s/g, '').toUpperCase()
    const response = await fetch(
      `https://api.postcodes.io/postcodes/${encodeURIComponent(cleanPostcode)}`
    )
    
    if (!response.ok) return null
    
    const data = await response.json()
    
    if (data.status !== 200 || !data.result) return null
    
    return {
      postcode: data.result.postcode,
      latitude: data.result.latitude,
      longitude: data.result.longitude,
      admin_district: data.result.admin_district,
      admin_ward: data.result.admin_ward,
      region: data.result.region,
      country: data.result.country,
      parliamentary_constituency: data.result.parliamentary_constituency,
    }
  } catch (error) {
    console.error('Postcode lookup failed:', error)
    return null
  }
}

/**
 * Find nearest postcodes to coordinates
 */
export async function getNearestPostcodes(
  lat: number, 
  lng: number, 
  limit: number = 5
): Promise<NearestPostcode[]> {
  try {
    const response = await fetch(
      `https://api.postcodes.io/postcodes?lon=${lng}&lat=${lat}&limit=${limit}`
    )
    
    if (!response.ok) return []
    
    const data = await response.json()
    
    if (data.status !== 200 || !data.result) return []
    
    return data.result.map((item: any) => ({
      postcode: item.postcode,
      distance: item.distance,
      latitude: item.latitude,
      longitude: item.longitude,
      admin_district: item.admin_district,
    }))
  } catch (error) {
    console.error('Nearest postcodes lookup failed:', error)
    return []
  }
}

/**
 * Reverse geocode - get location info from coordinates
 */
export async function reverseGeocode(lat: number, lng: number): Promise<PostcodeData | null> {
  const nearest = await getNearestPostcodes(lat, lng, 1)
  if (nearest.length === 0) return null
  return lookupPostcode(nearest[0].postcode)
}

/**
 * Bulk postcode lookup (max 100)
 */
export async function bulkLookupPostcodes(postcodes: string[]): Promise<PostcodeData[]> {
  try {
    const response = await fetch('https://api.postcodes.io/postcodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postcodes: postcodes.slice(0, 100) }),
    })
    
    if (!response.ok) return []
    
    const data = await response.json()
    
    return data.result
      .filter((item: any) => item.result !== null)
      .map((item: any) => ({
        postcode: item.result.postcode,
        latitude: item.result.latitude,
        longitude: item.result.longitude,
        admin_district: item.result.admin_district,
        admin_ward: item.result.admin_ward,
        region: item.result.region,
        country: item.result.country,
        parliamentary_constituency: item.result.parliamentary_constituency,
      }))
  } catch (error) {
    console.error('Bulk postcode lookup failed:', error)
    return []
  }
}