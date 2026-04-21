'use client'

import { useState, useEffect } from 'react'

interface GeolocationState {
  latitude: number | null
  longitude: number | null
  error: string | null
  loading: boolean
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported',
        loading: false,
      }))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          loading: false,
        })
      },
      (error) => {
        setState(prev => ({
          ...prev,
          error: error.message,
          loading: false,
        }))
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    )
  }, [])

  return state
}

// Helper to get neighbourhood from coordinates using Postcodes.io (UK) or Nominatim fallback
export async function getNeighbourhood(lat: number, lng: number): Promise<string> {
  try {
    // Try Postcodes.io first (better for UK)
    const postcodeRes = await fetch(
      `https://api.postcodes.io/postcodes?lon=${lng}&lat=${lat}&limit=1`
    )
    const postcodeData = await postcodeRes.json()
    
    if (postcodeData.result?.[0]) {
      const result = postcodeData.result[0]
      // Return the most specific area name available
      return result.admin_ward || result.admin_district || result.region || 'Unknown'
    }
    
    // Fallback to Nominatim for non-UK locations
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { 'User-Agent': 'NeighbourHub/1.0' } }
    )
    const data = await response.json()
    return data.address?.suburb || 
           data.address?.neighbourhood || 
           data.address?.city_district ||
           data.address?.city || 
           data.address?.town ||
           'Unknown'
  } catch (error) {
    console.error('Geolocation error:', error)
    return 'Unknown'
  }
}