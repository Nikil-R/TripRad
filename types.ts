export interface UserLocation {
  lat: number;
  lng: number;
  label?: string; // Optional city name if reverse geocoded or manually entered
}

export type Mood = 'Foodie' | 'Nature' | 'Culture' | 'Active' | 'Chilled' | 'Quirky';

export type TravelMethod = 'Car' | 'Bike' | 'Walk' | 'Public Transport';

export interface UserPreferences {
  timeAvailable: number; // in hours
  mood: Mood;
  travelMethod: TravelMethod;
  popularity?: 'popular' | 'hidden';
}

export interface Trip {
  id: string;
  name: string;
  type: string;
  description: string;
  travelTimeMinutes: number;
  stayTimeMinutes: number;
  totalTimeMinutes: number;
  score: number;
  itinerary: string[];
  reason: string; // Why it was recommended
  coordinates: {
    lat: number;
    lng: number;
  };
}

export interface GenerateTripsResponse {
  trips: Trip[];
}