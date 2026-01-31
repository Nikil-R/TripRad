import React from 'react';
import { Trip, TravelMethod, UserLocation } from '../types';
import { Navigation, Star, ArrowRight, Clock } from 'lucide-react';

interface TripCardProps {
  trip: Trip;
  travelMethod?: TravelMethod;
  availableTime: number; // in hours
  userLocation: UserLocation;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, travelMethod = 'Car', availableTime, userLocation }) => {
  const handleStartTrip = () => {
    let mapMode = 'driving';
    switch (travelMethod) {
      case 'Bike': 
        mapMode = 'motorcycle'; 
        break;
      case 'Walk': 
        mapMode = 'walking'; 
        break;
      case 'Public Transport': 
        mapMode = 'transit'; 
        break;
      default: 
        mapMode = 'driving';
    }
    
    // Construct origin: Use exact coordinates if available, otherwise fallback to label
    const origin = (userLocation.lat !== 0 || userLocation.lng !== 0)
      ? `${userLocation.lat},${userLocation.lng}`
      : encodeURIComponent(userLocation.label || '');

    // Construct destination: Use Name for better accuracy via Google Search
    // We add the coordinates as a secondary hint or use the name directly
    const destination = encodeURIComponent(trip.name);
    
    // Using Google Maps Directions with name-based destination for better place resolution
    const url = `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=${mapMode}`;
    window.open(url, '_blank');
  };

  // Calculate time breakdown
  const totalAvailableMinutes = availableTime * 60;
  const travelRoundTrip = trip.travelTimeMinutes * 2;
  const stayDuration = trip.stayTimeMinutes;
  
  const travelPercent = Math.min((travelRoundTrip / totalAvailableMinutes) * 100, 100);
  const stayPercent = Math.min((stayDuration / totalAvailableMinutes) * 100, 100 - travelPercent);
  const freePercent = 100 - travelPercent - stayPercent;
  const freeMinutes = Math.max(0, totalAvailableMinutes - travelRoundTrip - stayDuration);

  // SVG Config for Donut Chart
  const size = 90;
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  
  const travelStroke = (travelPercent / 100) * circumference;
  const stayStroke = (stayPercent / 100) * circumference;

  // Rotation logic for segments
  // Base circle starts at 3 o'clock. We rotate -90deg to start at 12 o'clock.
  // Travel segment starts at 0 offset.
  // Stay segment starts after travel segment. offset = -travelStroke.
  
  return (
    <div className="card rounded-2xl overflow-hidden flex flex-col h-full group animate-fade-in-up" style={{animationFillMode: 'both'}}>
      
      {/* Image Header */}
      <div className="h-44 bg-slate-100 relative overflow-hidden">
        <img 
          src={`https://picsum.photos/seed/${trip.id}/800/600`} 
          alt={trip.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-5 transition-all duration-300 group-hover:from-black/80">
          <div className="w-full transform transition-transform duration-300 group-hover:translate-y-[-4px]">
            <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] font-semibold text-white uppercase tracking-wide bg-indigo-600 px-2.5 py-1 rounded-md scale-hover">
                  {trip.type}
                </span>
                <div className="flex items-center gap-1 bg-white/90 px-2.5 py-1 rounded-md shadow-lg">
                    <Star size={12} className="text-amber-500 fill-amber-500" />
                    <span className="text-xs font-semibold text-slate-700">{trip.score}%</span>
                </div>
            </div>
            <h3 className="text-xl font-bold text-white leading-tight">{trip.name}</h3>
          </div>
        </div>
      </div>

      <div className="p-5 flex flex-col flex-grow">
        <p className="text-slate-500 text-sm leading-relaxed mb-5 line-clamp-2">
            {trip.description}
        </p>

        {/* Time Budget */}
        <div className="mb-5 bg-slate-50 rounded-xl p-4 border border-slate-100 hover:border-indigo-200 transition-all duration-300 hover:shadow-md">
           <div className="flex items-center gap-5">
              
              <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
                  <svg width={size} height={size} className="transform -rotate-90 origin-center">
                      <circle 
                        cx={size/2} cy={size/2} r={radius} 
                        fill="none" 
                        stroke="#e2e8f0" 
                        strokeWidth={strokeWidth} 
                      />
                      
                      <circle 
                        cx={size/2} cy={size/2} r={radius} 
                        fill="none" 
                        stroke="#cbd5e1" 
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${travelStroke} ${circumference}`}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                      
                      <circle 
                        cx={size/2} cy={size/2} r={radius} 
                        fill="none" 
                        stroke="#6366f1" 
                        strokeWidth={strokeWidth + 1}
                        strokeDasharray={`${stayStroke} ${circumference}`}
                        strokeDashoffset={-travelStroke}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                  </svg>
                  
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-lg font-bold leading-none text-slate-800">{availableTime}h</span>
                  </div>
              </div>

              <div className="flex-grow space-y-2">
                 <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-500">Travel</span>
                    <span className="text-sm font-semibold text-slate-700">{travelRoundTrip} min</span>
                 </div>
                 <div className="flex items-center justify-between">
                    <span className="text-xs text-indigo-600 font-medium">Stay</span>
                    <span className="text-sm font-semibold text-indigo-600">{stayDuration} min</span>
                 </div>
              </div>
           </div>
        </div>

        <div className="mt-auto">
          <ul className="space-y-2 mb-5">
            {trip.itinerary.slice(0, 3).map((item, idx) => (
              <li key={idx} className="flex gap-2.5 text-sm text-slate-600 items-start group/item hover:translate-x-1 transition-transform duration-200">
                <div className="w-5 h-5 rounded-full bg-indigo-600 flex items-center justify-center text-[10px] text-white font-semibold shrink-0 mt-0.5 group-hover/item:scale-110 transition-transform">
                  {idx + 1}
                </div>
                <span className="leading-tight">{item}</span>
              </li>
            ))}
          </ul>
        </div>
        
        <button 
          onClick={handleStartTrip}
          className="elastic w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-indigo-300 hover:-translate-y-1 group/btn"
        >
          <Navigation size={14} className="group-hover/btn:animate-bounce-subtle" />
          Start Navigation
        </button>
      </div>
    </div>
  );
};