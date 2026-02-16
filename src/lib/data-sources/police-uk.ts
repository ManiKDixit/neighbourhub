/**
 * Police UK API Integration
 * Free street-level crime data
 * Docs: https://data.police.uk/docs/
 */

export interface Crime {
  id: string
  category: string
  location: {
    latitude: string
    longitude: string
    street: {
      name: string
    }
  }
  month: string
  outcome_status: {
    category: string
    date: string
  } | null
}

export interface NeighbourhoodTeam {
  name: string
  rank: string
  bio: string | null
}

export interface NeighbourhoodEvent {
  title: string
  description: string
  address: string
  start_date: string
  end_date: string | null
}

export interface CrimeSummary {
  category: string
  count: number
}

/**
 * Get street-level crimes near a location
 * @param lat Latitude
 * @param lng Longitude
 * @param date Optional date in YYYY-MM format (defaults to latest)
 */
export async function getCrimesNearLocation(
  lat: number,
  lng: number,
  date?: string
): Promise<Crime[]> {
  try {
    let url = `https://data.police.uk/api/crimes-street/all-crime?lat=${lat}&lng=${lng}`
    if (date) url += `&date=${date}`
    
    const response = await fetch(url)
    
    if (!response.ok) {
      // API returns 503 if no data for date
      if (response.status === 503) return []
      throw new Error(`Police API error: ${response.status}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error('Crime data fetch failed:', error)
    return []
  }
}

/**
 * Get crime summary by category for an area
 */
export async function getCrimeSummary(
  lat: number,
  lng: number,
  date?: string
): Promise<CrimeSummary[]> {
  const crimes = await getCrimesNearLocation(lat, lng, date)
  
  const summary: Record<string, number> = {}
  
  crimes.forEach(crime => {
    const category = crime.category.replace(/-/g, ' ')
    summary[category] = (summary[category] || 0) + 1
  })
  
  return Object.entries(summary)
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Get neighbourhood team for a location
 */
export async function getNeighbourhoodTeam(
  lat: number,
  lng: number
): Promise<NeighbourhoodTeam[]> {
  try {
    // First, find the neighbourhood force and team
    const locateResponse = await fetch(
      `https://data.police.uk/api/locate-neighbourhood?q=${lat},${lng}`
    )
    
    if (!locateResponse.ok) return []
    
    const location = await locateResponse.json()
    const { force, neighbourhood } = location
    
    // Then get the team
    const teamResponse = await fetch(
      `https://data.police.uk/api/${force}/${neighbourhood}/people`
    )
    
    if (!teamResponse.ok) return []
    
    return await teamResponse.json()
  } catch (error) {
    console.error('Neighbourhood team fetch failed:', error)
    return []
  }
}

/**
 * Get upcoming neighbourhood events
 */
export async function getNeighbourhoodEvents(
  lat: number,
  lng: number
): Promise<NeighbourhoodEvent[]> {
  try {
    const locateResponse = await fetch(
      `https://data.police.uk/api/locate-neighbourhood?q=${lat},${lng}`
    )
    
    if (!locateResponse.ok) return []
    
    const location = await locateResponse.json()
    const { force, neighbourhood } = location
    
    const eventsResponse = await fetch(
      `https://data.police.uk/api/${force}/${neighbourhood}/events`
    )
    
    if (!eventsResponse.ok) return []
    
    return await eventsResponse.json()
  } catch (error) {
    console.error('Neighbourhood events fetch failed:', error)
    return []
  }
}

/**
 * Format crime data for RAG embedding
 */
export function formatCrimeDataForEmbedding(
  crimes: CrimeSummary[],
  neighbourhood: string
): string {
  if (crimes.length === 0) {
    return `No recent crime data available for ${neighbourhood}.`
  }
  
  const total = crimes.reduce((sum, c) => sum + c.count, 0)
  const topCrimes = crimes.slice(0, 5)
  
  return `Crime summary for ${neighbourhood} (last month): ` +
    `Total incidents: ${total}. ` +
    `Most common: ${topCrimes.map(c => `${c.category} (${c.count})`).join(', ')}. ` +
    `This data comes from official Police UK records.`
}