import React from 'react';

export const TripCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-3xl shadow-lg shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col h-full">
      
      {/* Image Header Skeleton */}
      <div className="h-40 bg-slate-200 relative animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
        <div className="absolute bottom-5 left-5 right-5">
           <div className="flex justify-between items-end mb-2">
               <div className="h-4 w-16 bg-white/60 rounded"></div>
               <div className="h-4 w-8 bg-white/60 rounded-full"></div>
           </div>
           <div className="h-6 w-3/4 bg-white/70 rounded shadow-sm"></div>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-grow animate-pulse">
        
        {/* Description Lines */}
        <div className="space-y-3 mb-6 border-l-2 border-slate-100 pl-3">
            <div className="h-2.5 bg-slate-200 rounded w-full"></div>
            <div className="h-2.5 bg-slate-200 rounded w-11/12"></div>
            <div className="h-2.5 bg-slate-200 rounded w-4/5"></div>
        </div>

        {/* Donut Chart Skeleton */}
        <div className="mb-6 bg-slate-50 rounded-2xl p-4 border border-slate-100 flex items-center gap-5">
           <div className="h-[90px] w-[90px] rounded-full border-8 border-slate-200 flex-shrink-0"></div>
           <div className="flex-grow space-y-3">
              <div className="flex justify-between items-center">
                  <div className="h-2.5 w-20 bg-slate-200 rounded"></div>
                  <div className="h-4 w-8 bg-slate-200 rounded"></div>
              </div>
              <div className="flex justify-between items-center">
                  <div className="h-2.5 w-20 bg-slate-200 rounded"></div>
                  <div className="h-4 w-8 bg-slate-200 rounded"></div>
              </div>
           </div>
        </div>

        {/* Highlights */}
        <div className="mt-auto">
           <div className="h-3 w-24 bg-slate-200 rounded mb-3"></div>
           <div className="space-y-2.5 mb-6">
              <div className="flex gap-2 items-center">
                 <div className="h-3 w-3 bg-slate-200 rounded-full shrink-0"></div>
                 <div className="h-2.5 w-10/12 bg-slate-200 rounded"></div>
              </div>
              <div className="flex gap-2 items-center">
                 <div className="h-3 w-3 bg-slate-200 rounded-full shrink-0"></div>
                 <div className="h-2.5 w-9/12 bg-slate-200 rounded"></div>
              </div>
           </div>
        </div>
        
        {/* Button */}
        <div className="w-full h-12 bg-slate-100 rounded-xl"></div>
      </div>
    </div>
  );
};