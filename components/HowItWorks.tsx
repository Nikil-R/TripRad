import React from 'react';

export const HowItWorks: React.FC = () => {
  return (
    <div className="space-y-8 animate-fade-in max-w-3xl mx-auto">
      <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-4">1. Core Idea</h2>
        <p className="text-slate-600 leading-relaxed text-lg">
          Micro-Travel Planner is a location-aware recommendation system that suggests short 2–3 hour trips near you. 
          Unlike normal travel apps that assume you have a long weekend and a stable life, this system focuses on 
          <strong> quick, realistic escapes</strong>.
        </p>
      </section>

      <section className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
        <h2 className="text-2xl font-bold text-slate-800 mb-6">2. Conceptual Model</h2>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 text-center font-mono text-sm md:text-base text-slate-700">
          <span className="bg-white px-3 py-1 rounded shadow-sm">User Location + Time Constraint</span>
          <div className="my-2 text-indigo-500 text-xl">↓</div>
          <span className="bg-white px-3 py-1 rounded shadow-sm">Nearby Places Dataset (Gemini)</span>
          <div className="my-2 text-indigo-500 text-xl">↓</div>
          <span className="bg-white px-3 py-1 rounded shadow-sm">Filtering & Scoring</span>
          <div className="my-2 text-indigo-500 text-xl">↓</div>
          <span className="bg-indigo-600 text-white px-3 py-1 rounded shadow-sm">Curated Mini-Trip Suggestions</span>
        </div>
      </section>

      <div className="grid md:grid-cols-2 gap-6">
        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span className="bg-blue-100 text-blue-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">3.1</span>
            Location Module
          </h3>
          <p className="text-slate-600 text-sm">
            Detects user coordinates (lat, long) via GPS or Web Geolocation API. Acts as the center point for all distance calculations.
          </p>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span className="bg-emerald-100 text-emerald-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">3.4</span>
            Filtering Logic
          </h3>
          <p className="text-slate-600 text-sm">
            Rule-based engine. <br/>
            <code>IF distance &lt; 10km AND total_time &lt; Available Time THEN eligible.</code>
          </p>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span className="bg-amber-100 text-amber-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">3.5</span>
            Scoring System
          </h3>
          <p className="text-slate-600 text-sm">
            Places are ranked based on travel efficiency and mood alignment.
            <br/>
            <code className="text-xs mt-2 block bg-slate-100 p-2 rounded">Score = w1*distance + w2*rating + w3*crowd</code>
          </p>
        </section>

        <section className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold text-slate-800 mb-3 flex items-center gap-2">
            <span className="bg-purple-100 text-purple-600 w-8 h-8 rounded-full flex items-center justify-center text-sm">3.6</span>
            Output Module
          </h3>
          <p className="text-slate-600 text-sm">
            Displays top curated recommendations (mix of popular & hidden gems) with estimated travel times and mini-itineraries.
          </p>
        </section>
      </div>
    </div>
  );
};