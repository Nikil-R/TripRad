import { useState, useEffect } from 'react';
import { UserLocation } from '../types';

interface GeolocationState {
  location: UserLocation | null;
  error: string | null;
  loading: boolean;
  getLocation: () => void;
}

export const useGeolocation = (): GeolocationState => {
  const [location, setLocation] = useState<UserLocation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    setLoading(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        
        let addressLabel = "Current Location";
        try {
          // Reverse geocode using OpenStreetMap (Free, no key required for low volume)
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`, {
            headers: { 
                'Accept-Language': 'en',
                'User-Agent': 'NearGo-App-v1.0' // Nominatim requires a user agent
            }
          });
          const data = await response.json();
          
          if (data.address) {
            const addr = data.address;
            // Try to build a precise local string: "Road, Neighborhood/Suburb"
            const parts = [];
            if (addr.road) parts.push(addr.road);
            if (addr.neighbourhood) parts.push(addr.neighbourhood);
            else if (addr.suburb) parts.push(addr.suburb);
            else if (addr.city_district) parts.push(addr.city_district);
            
            if (parts.length > 0) {
                addressLabel = parts.join(', ');
            } else {
                addressLabel = data.display_name.split(',').slice(0, 2).join(', ');
            }
          }
        } catch (e) {
          console.error("Reverse geocoding failed", e);
        }

        setLocation({
          lat: latitude,
          lng: longitude,
          label: addressLabel
        });
        setLoading(false);
      },
      (err) => {
        let errorMessage = "Unable to retrieve your location";
        if (err.code === err.PERMISSION_DENIED) {
          errorMessage = "Location permission denied. Please allow access or enter manually.";
        }
        setError(errorMessage);
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  };

  return { location, error, loading, getLocation };
};