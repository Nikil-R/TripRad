import { GoogleGenAI, Type, Schema } from "@google/genai";
import { UserLocation, UserPreferences, Trip, TravelMethod } from '../types';

// Initialize Gemini
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const TRIP_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    trips: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          name: { type: Type.STRING, description: "Specific Name of the place (e.g. 'The Old Book Cellar', not just 'Bookstore')" },
          type: { type: Type.STRING, description: "Category e.g., Speakeasy, Ruin, hidden Garden, Oddity" },
          description: { type: Type.STRING, description: "Engaging description explaining WHY it is a hidden gem. Mention specific details." },
          travelTimeMinutes: { type: Type.NUMBER, description: "Realistic one-way travel time in minutes considering traffic/mode." },
          stayTimeMinutes: { type: Type.NUMBER, description: "Recommended duration of stay in minutes" },
          totalTimeMinutes: { type: Type.NUMBER, description: "Total trip duration including travel" },
          score: { type: Type.NUMBER, description: "Relevance score from 1-100 based on uniqueness" },
          itinerary: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "3-4 bullet points for a mini-itinerary"
          },
          reason: { type: Type.STRING, description: "Cite the simulated source or specific quality (e.g. 'Rated #1 on local spicy food forum', 'Bib Gourmand hidden pick')." },
          coordinates: {
            type: Type.OBJECT,
            properties: {
              lat: { type: Type.NUMBER, description: "Latitude of the destination" },
              lng: { type: Type.NUMBER, description: "Longitude of the destination" }
            },
            required: ["lat", "lng"]
          }
        },
        required: ["id", "name", "type", "description", "travelTimeMinutes", "stayTimeMinutes", "totalTimeMinutes", "score", "itinerary", "reason", "coordinates"]
      }
    }
  },
  required: ["trips"]
};

// --- Math Helpers ---

function toRad(value: number): number {
  return (value * Math.PI) / 180;
}

// Calculate straight-line distance in KM
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of the earth in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Estimate baseline time based on physics and real-world city constraints
// This is used as a "sanity check" lower bound.
function estimatePhysicsTime(distanceKm: number, method: TravelMethod): number {
  let speedKmH = 25; 
  let routeFactor = 1.3;
  let overheadMins = 5;

  switch (method) {
    case 'Walk':
      speedKmH = 4.5; 
      routeFactor = 1.2; 
      overheadMins = 0;
      break;
      
    case 'Bike': 
      speedKmH = 28; // Conservative city biking speed
      routeFactor = 1.25; 
      overheadMins = 2;
      break;
      
    case 'Public Transport':
      speedKmH = 18; 
      routeFactor = 1.5; 
      overheadMins = 12; 
      break;
      
    case 'Car':
      speedKmH = 22; // City traffic average
      routeFactor = 1.4; 
      overheadMins = 8; 
      break;
  }
  
  const estimatedRoadDistance = distanceKm * routeFactor;
  const travelTimeMinutes = (estimatedRoadDistance / speedKmH) * 60 + overheadMins;
  
  return Math.round(travelTimeMinutes); 
}

// --- Result Cache ---
// We keep a simple in-memory cache to ensure stable results for the same session
const resultCache = new Map<string, Trip[]>();

export const generateTrips = async (
  location: UserLocation,
  prefs: UserPreferences
): Promise<Trip[]> => {
  // Round coordinates to 4 decimal places (~10m) to handle slight GPS jitter
  const cacheKey = `${location.lat.toFixed(4)}|${location.lng.toFixed(4)}|${location.label}|${prefs.timeAvailable}|${prefs.mood}|${prefs.travelMethod}|${prefs.popularity}`;
  
  if (resultCache.has(cacheKey)) {
    console.log("Serving from cache for key:", cacheKey);
    return resultCache.get(cacheKey)!;
  }

  const modelId = "gemini-2.5-flash"; 

  const isManualLocation = location.lat === 0 && location.lng === 0;

  const locationStr = location.label 
    ? (isManualLocation ? location.label : `${location.label} (Lat: ${location.lat}, Lng: ${location.lng})`)
    : `Lat: ${location.lat}, Lng: ${location.lng}`;

  const maxOneWayMinutes = Math.floor((prefs.timeAvailable * 60) * 0.25);
  
  const subredditRef = location.label && location.label !== "Current Location" 
    ? `r/${location.label.replace(/\s+/g, '')}` 
    : "local city subreddits";

   const isFoodiePopular = prefs.mood === 'Foodie' && prefs.popularity === 'popular';

   const coreStrategy = isFoodiePopular 
     ? `
       **STRATEGY: POPULAR & ICONIC FOOD SPOTS.**
       The user explicitly wants popular, well-known, or "famous" places to eat.
       - IGNORE the "Hidden Gems" rule.
       - Suggest places with high review counts (1000+) and 4.5+ ratings.
       - Focus on iconic local dishes, viral food spots, or highly-rated institutions.
       - Variety Ratio: 4x Popular/Iconic, 2x Local Favorites.
     `
    : `
      **CRITICAL PRIORITY: SURFACING "THE BEST UNDERRATED" PLACES.**
      Do not suggest random low-quality obscure places. We want high-quality, high-character spots that are currently flying under the radar.

      DATA MINING SIMULATION (Perform a deep-dive search simulation):
      Act as if you are scraping and analyzing data from ALL of the following specific sources:
      1. **Local Food & Culture Blogs**: Eater Heatmaps (the deep cuts), The Infatuation "Under the Radar", TimeOut "Local Secrets", and verified local food influencer lists.
      2. **Niche Communities**: r/${subredditRef} (specifically "hidden gem" threads), Chowhound archives, specialized forums (Urban Exploration, CoffeeGeek, BeerAdvocate).
      3. **Curated Databases**: Atlas Obscura (Oddities), Roadside America, Michelin Guide (Bib Gourmand only - high quality/value), James Beard semi-finalists (often lesser known).
      4. **Maps Heuristics**: Look for the "Local Legend" pattern: **High Rating (4.7 to 5.0)** but **Low Review Count (<500)**. This signals a place locals love but tourists haven't ruined.

      SELECTION RULES:
      1. **The "Chef/Historian" Test**: Would a local chef eat here on their day off? Would a local historian visit this spot? If yes, include it.
      2. **Avoid "Mid"**: If a place is unknown because it is average, DO NOT suggest it. It must be unknown because it is *hidden*, *new*, or *misunderstood*, but EXCELLENT.
      3. **Variety Ratio**:
         - 4x "Cult Classics" (Incredible quality, loyal local following, zero marketing).
         - 1x "Weird/Unique" (Something that exists nowhere else, e.g. a bar inside a clock tower).
         - 1x "New/Rising" (Opened recently, high buzz among locals, unknown globally).
    `;

  const prompt = `
    User Context:
    - Start Location: ${locationStr}
    - Available Time Window: ${prefs.timeAvailable} hours (${prefs.timeAvailable * 60} minutes)
    - Mood/Preference: ${prefs.mood}
    ${prefs.mood === 'Foodie' ? `- Dining Style: ${prefs.popularity === 'popular' ? "Popular / Famous / Viral" : "Hidden Gems / Hole-in-the-wall"}` : ''}
    - Travel Method: ${prefs.travelMethod}
    - Exploration Goal: Find a mix of high-quality "Hidden Gems" AND iconic "Popular Hotspots" within strict proximity.

    TASK:
    Generate 6 distinct micro-trip recommendations. 
    
    🚨 **SEARCH-READY PROTOCOL - READ CAREFULLY** 🚨:
    
    1. **SEARCHABLE NAMES**: 
       - The 'name' field MUST be formatted for a Google Maps Search.
       - FORMAT: "[Place Name], [Neighborhood/Specific Area], [City]"
       - Example: "The Hole in the Wall Cafe, Koramangala, Bangalore"
       - This is how the app will find the location. If the name is vague, navigation will fail.
    
    2. **GEOGRAPHIC LOCK**: 
       - Every place MUST be within ${prefs.travelMethod === 'Walk' ? '3km' : prefs.travelMethod === 'Bike' ? '8km' : '15km'} of ${locationStr}.
       - Do NOT suggest places on the other side of the city.
    
    3. **VERIFIED REAL PLACES**: 
       - hallucinations are forbidden. Suggest ONLY actual, permanent businesses or landmarks that are searchable on Google Maps as of today.
    
    4. **COORDINATES AS BACKUP**:
       - Provide coordinates as an additional verification, but the NAME is the primary search key.
    
    STRATEGY: Balanced Discovery
    - 3x "Hidden Gems" (High quality, low review count, local secret).
    - 2x "Popular Staples" (Local favorites, busy but worth it, high reputation).
    - 1x "Wildcard" (Unique, quirky, or specific to the "${prefs.mood}" vibe).
    
    Quality Bar: Every place must be high-quality (equivalent to 4.4+ stars).

    ${coreStrategy}

    TRAVEL TIME CALCULATION:
    - Estimate travel time realistically.

    OUTPUT:
    Return strictly JSON matching the schema. Use specific, searchable names.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: TRIP_SCHEMA,
        temperature: 0, 
        systemInstruction: isFoodiePopular 
           ? "You are a local foodie guide who knows all the most popular, must-visit, and top-rated restaurants."
           : "You are the ultimate 'Local Insider'. You ignore the Top 10 lists found on TripAdvisor. Instead, you scrape local forums, old blogs, and neighborhood whispers to find the absolute best underrated spots. You care about quality, authenticity, and soul. You despise tourist traps."
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data received from Gemini");

    const parsed = JSON.parse(jsonText);
    const rawTrips: Trip[] = parsed.trips || [];

    // --- Verification & Correction Logic ---
    const verifiedTrips = rawTrips.map(trip => {
      let finalTravelTime = trip.travelTimeMinutes;
      let distKm = 0;

      // Only perform physics checks if we have valid start coordinates
      if (!isManualLocation) {
        distKm = calculateDistance(
          location.lat, 
          location.lng, 
          trip.coordinates.lat, 
          trip.coordinates.lng
        );

        // Calculate a "Sanity Check" time based on physics
        const physicsTime = estimatePhysicsTime(distKm, prefs.travelMethod);

        // Logic:
        // If Gemini suggests a time that is physically impossible (e.g., flying speed), clamp it to the physics time.
        // We define "impossible" as being less than 60% of the conservative physics estimate.
        // Otherwise, trust Gemini (it knows about traffic, rivers, one-ways better than Haversine).
        if (trip.travelTimeMinutes < physicsTime * 0.6) {
           finalTravelTime = physicsTime;
        } else {
           // If reasonable, stick with Gemini, but maybe average it if it's very different? 
           // Actually, just trusting Gemini with a lower bound is safest.
           finalTravelTime = Math.max(trip.travelTimeMinutes, physicsTime * 0.8);
        }
      }

      return {
        ...trip,
        travelTimeMinutes: Math.round(finalTravelTime),
        totalTimeMinutes: Math.round((finalTravelTime * 2) + trip.stayTimeMinutes),
        _distKm: distKm 
      };
    }).filter(trip => {
      // If manual location, we trust Gemini's filtering implicitly as we can't calc distance
      if (isManualLocation) return true;

      // Strict Filtering for GPS users
      // Allow a small buffer over the budget
      const maxAllowedTravel = maxOneWayMinutes + 15; 
      
      // Distance filter: Strict proximity (Max 12km for sanity)
      const maxDist = prefs.travelMethod === 'Car' ? 15 : 8;
      const isWithinDistance = (trip as any)._distKm <= maxDist; 

      return trip.travelTimeMinutes <= maxAllowedTravel && isWithinDistance;
    });

    // Save to cache before returning
    resultCache.set(cacheKey, verifiedTrips);
    return verifiedTrips;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};