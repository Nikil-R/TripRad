import React, { useState } from 'react';
import { useGeolocation } from '../hooks/useGeolocation';
import { generateTrips } from '../services/geminiService';
import { Trip, Mood, UserPreferences, UserLocation, TravelMethod } from '../types';
import { Button } from './Button';
import { TripCard } from './TripCard';
import { TripCardSkeleton } from './TripCardSkeleton';
import { MapPin, Clock, Smile, Search, AlertCircle, Car, Bike, Footprints, Bus, Zap, SlidersHorizontal, Utensils } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type SortOption = 'recommended' | 'distance' | 'rating' | 'duration';

export const Planner: React.FC = () => {
  const { location, loading: locLoading, error: locError, getLocation } = useGeolocation();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [manualLocation, setManualLocation] = useState('');
  const [time, setTime] = useState(2.5);
  const [mood, setMood] = useState<Mood>('Chilled');
  const [travelMethod, setTravelMethod] = useState<TravelMethod>('Car');
  const [popularity, setPopularity] = useState<'popular' | 'hidden'>('hidden'); // Default to hidden gems
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('recommended');

  const moods: Mood[] = ['Foodie', 'Nature', 'Culture', 'Active', 'Chilled', 'Quirky'];

  const handleSearch = async () => {
    if (!isAuthenticated) {
      navigate('/signin');
      return;
    }

    let userLoc: UserLocation | null = location;
    
    if (!userLoc && manualLocation) {
        userLoc = { lat: 0, lng: 0, label: manualLocation };
    }

    if (!userLoc) {
      setError("Please enable location or enter a city manually.");
      return;
    }

    setLoading(true);
    setError(null);
    setTrips([]);
    setSortBy('recommended'); // Reset sort on new search

    const prefs: UserPreferences = {
      timeAvailable: time,
      mood: mood,
      travelMethod: travelMethod,
      popularity: mood === 'Foodie' ? popularity : 'hidden' // Only apply popularity preference for Foodie, otherwise default to hidden
    };

    try {
      const results = await generateTrips(userLoc, prefs);
      setTrips(results);
    } catch (err) {
      setError("Gemini couldn't find trips right now. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sortedTrips = [...trips].sort((a, b) => {
    switch (sortBy) {
      case 'distance':
        return a.travelTimeMinutes - b.travelTimeMinutes;
      case 'rating':
        return b.score - a.score;
      case 'duration':
        return a.totalTimeMinutes - b.totalTimeMinutes;
      case 'recommended':
      default:
        // Assume API returns roughly in order of relevance, or preserve original index
        return 0; 
    }
  });

  return (
    <div className="space-y-10 animate-fade-in pb-20">
      
      {/* Input Section */}
      <section className="card rounded-2xl p-8 md:p-10 animate-fade-in-up delay-300" style={{animationFillMode: 'both'}}>
        <div className="grid md:grid-cols-2 lg:grid-cols-12 gap-8">
          
          {/* Location */}
          <div className="lg:col-span-4 space-y-3 animate-slide-left delay-400" style={{animationFillMode: 'both'}}>
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <MapPin size={16} className="text-indigo-600 icon-spin-hover" />
              Your Location
            </label>
            <div className="flex flex-col gap-3">
              {!location ? (
                <button 
                  onClick={getLocation}
                  disabled={locLoading}
                  className="elastic w-full py-4 px-5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-lg hover:shadow-indigo-300 hover:-translate-y-1"
                >
                  <MapPin size={16} className={locLoading ? 'animate-spin-slow' : ''} />
                  {locLoading ? "Finding..." : "Use My Location"}
                </button>
              ) : (
                <div className="w-full py-4 px-5 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-semibold flex items-center justify-between border border-emerald-200 animate-scale-in">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="truncate max-w-[200px]">{location.label}</span>
                  </div>
                  <button onClick={() => window.location.reload()} className="text-emerald-500 hover:text-emerald-700 icon-spin-hover">
                    <SlidersHorizontal size={14} />
                  </button>
                </div>
              )}
              
              {!location && (
                 <input 
                   type="text" 
                   placeholder="Or type your city..." 
                   value={manualLocation}
                   onChange={(e) => setManualLocation(e.target.value)}
                   className="w-full py-3 px-4 bg-white border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all placeholder:text-slate-400"
                 />
              )}
            </div>
          </div>

          {/* Time Budget */}
          <div className="lg:col-span-3 space-y-3 animate-fade-in-up delay-500" style={{animationFillMode: 'both'}}>
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Clock size={16} className="text-indigo-600" />
              Time Available
            </label>
            <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 h-[110px] flex flex-col justify-center hover:border-indigo-200 transition-colors">
              <div className="flex justify-between text-xs text-slate-400 mb-3">
                <span>1h</span>
                <span>6h</span>
              </div>
              <input 
                type="range" 
                min="1" 
                max="6" 
                step="0.5" 
                value={time} 
                onChange={(e) => setTime(parseFloat(e.target.value))}
                className="w-full cursor-pointer"
              />
               <div className="mt-3 text-center">
                 <span className="inline-block px-3 py-1 bg-indigo-600 text-white rounded-lg font-semibold text-sm transition-all hover:scale-105">
                    {time} hours
                 </span>
               </div>
            </div>
          </div>

          {/* Transit Method */}
          <div className="lg:col-span-5 space-y-3 animate-slide-right delay-500" style={{animationFillMode: 'both'}}>
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Car size={16} className="text-indigo-600" />
              Travel Method
            </label>
            <div className="grid grid-cols-4 gap-2 h-[110px]">
              {[
                { type: 'Car', icon: Car, label: 'Drive', color: 'text-blue-600' },
                { type: 'Bike', icon: Bike, label: 'Two-Wheeler', color: 'text-emerald-600' },
                { type: 'Walk', icon: Footprints, label: 'Walk', color: 'text-orange-600' },
                { type: 'Public Transport', icon: Bus, label: 'Transit', color: 'text-violet-600' },
              ].map((m, idx) => (
                <button
                  key={m.type}
                  onClick={() => setTravelMethod(m.type as TravelMethod)}
                  className={`elastic rounded-2xl text-[11px] font-bold transition-all flex flex-col items-center justify-center gap-2 border-2 hover:-translate-y-1.5 ${
                    travelMethod === m.type
                      ? 'bg-white border-indigo-600 text-indigo-700 shadow-[0_8px_20px_-4px_rgba(99,102,241,0.3)] z-10'
                      : 'bg-slate-50 border-transparent text-slate-500 hover:bg-white hover:border-slate-200'
                  }`}
                  style={{animationDelay: `${600 + idx * 100}ms`}}
                >
                  <div className={`p-2 rounded-xl transition-all duration-300 ${travelMethod === m.type ? 'bg-indigo-50 scale-110' : 'bg-transparent'}`}>
                    <m.icon size={22} className={travelMethod === m.type ? 'animate-bounce-subtle' : ''} />
                  </div>
                  <span className="tracking-tight">{m.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Vibe Selection */}
          <div className="md:col-span-2 lg:col-span-12 space-y-3 border-t border-slate-100 pt-6 mt-2 animate-fade-in-up delay-600" style={{animationFillMode: 'both'}}>
            <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
              <Smile size={16} className="text-indigo-600" />
              What's your mood?
            </label>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                {moods.map((m, idx) => (
                  <button
                    key={m}
                    onClick={() => setMood(m)}
                    className={`elastic px-4 py-2 rounded-lg text-sm font-semibold transition-all border hover:-translate-y-1 ${
                      mood === m 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200 scale-105' 
                        : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300 hover:shadow-md'
                    }`}
                    style={{animationDelay: `${700 + idx * 50}ms`}}
                  >
                    {m}
                  </button>
                ))}
              </div>

              {mood === 'Foodie' && (
                <div className="flex items-center gap-3 bg-amber-50 p-3 rounded-xl border border-amber-200 animate-scale-in">
                    <Utensils size={16} className="text-amber-600" />
                    <span className="text-sm font-medium text-amber-700">Looking for:</span>
                    <div className="flex bg-white rounded-lg p-0.5 border border-amber-200">
                        <button 
                            onClick={() => setPopularity('hidden')}
                            className={`elastic px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${popularity === 'hidden' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Hidden Gems
                        </button>
                        <button 
                            onClick={() => setPopularity('popular')}
                            className={`elastic px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${popularity === 'popular' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50'}`}
                        >
                            Popular Spots
                        </button>
                    </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex justify-center animate-fade-in-up delay-700" style={{animationFillMode: 'both'}}>
          <Button onClick={handleSearch} isLoading={loading} variant="primary" className="elastic w-full md:w-auto min-w-[240px] py-4 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-700 text-white transition-all hover:shadow-xl hover:shadow-indigo-300 hover:-translate-y-1">
            <Search size={18} className={loading ? 'animate-spin-slow' : ''} />
            Find Recommendations
          </Button>
        </div>
        
        {error && (
            <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm font-medium flex items-center gap-2 border border-red-100">
                <AlertCircle size={16} />
                {error}
            </div>
        )}
      </section>

      {/* Loading Skeleton Section */}
      {loading && (
        <section className="space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2">
             <div className="space-y-2">
                <div className="h-8 w-64 skeleton rounded-lg"></div>
                <div className="h-4 w-48 skeleton rounded-lg delay-100"></div>
             </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
             <div className="animate-fade-in-up delay-100" style={{animationFillMode: 'both'}}><TripCardSkeleton /></div>
             <div className="animate-fade-in-up delay-200" style={{animationFillMode: 'both'}}><TripCardSkeleton /></div>
             <div className="animate-fade-in-up delay-300" style={{animationFillMode: 'both'}}><TripCardSkeleton /></div>
          </div>
        </section>
      )}

      {/* Results Section */}
      {!loading && trips.length > 0 && (
        <section className="space-y-6 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 px-2 animate-fade-in-up" style={{animationFillMode: 'both'}}>
            <div>
              <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                <Zap className="text-amber-400 fill-amber-400 animate-pulse" />
                Curated For You
              </h2>
              <p className="text-slate-500 text-sm mt-1">Based on {time}h available time via {travelMethod}</p>
            </div>

            {/* Sorting Control */}
            <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 shadow-sm animate-slide-right delay-200" style={{animationFillMode: 'both'}}>
                <div className="px-3 py-1.5 flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wide border-r border-slate-100">
                   <SlidersHorizontal size={14} />
                   Sort By
                </div>
                <div className="flex">
                    {[
                        { id: 'recommended', label: 'Recommended' },
                        { id: 'rating', label: 'Top Rated' },
                        { id: 'distance', label: 'Nearest' },
                        { id: 'duration', label: 'Shortest Trip' }
                    ].map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => setSortBy(opt.id as SortOption)}
                            className={`elastic px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                                sortBy === opt.id 
                                    ? 'bg-indigo-100 text-indigo-700 shadow-sm' 
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                            }`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {sortedTrips.map((trip, idx) => (
              <div 
                key={trip.id}
                className="animate-fade-in-up"
                style={{animationDelay: `${300 + idx * 100}ms`, animationFillMode: 'both'}}
              >
                <TripCard 
                  trip={trip} 
                  travelMethod={travelMethod} 
                  availableTime={time}
                  userLocation={location || { lat: 0, lng: 0, label: manualLocation || "Current Location" }}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {!loading && trips.length === 0 && !error && (
         <div className="text-center py-24 opacity-60 animate-fade-in">
             <div className="w-20 h-20 bg-gradient-to-tr from-slate-100 to-slate-200 rounded-full mx-auto mb-6 flex items-center justify-center shadow-inner animate-float">
                 <MapPin className="text-slate-400" size={32} />
             </div>
             <h3 className="text-lg font-semibold text-slate-700">Ready to explore?</h3>
             <p className="text-slate-500">Configure your preferences above to start discovering.</p>
         </div>
      )}
    </div>
  );
};