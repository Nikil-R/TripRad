import React from 'react';
import { MapPin, LogOut, User as UserIcon } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const Header: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200/50 animate-fade-in">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center max-w-5xl">
        <Link to="/" className="flex items-center gap-3 cursor-pointer group decoration-none">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-lg group-hover:shadow-indigo-300">
            <MapPin size={20} className="text-white transition-transform duration-300 group-hover:animate-bounce-subtle" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
              NearGo
            </h1>
            <span className="text-[10px] text-slate-400 font-medium">Smart Discovery</span>
          </div>
        </Link>
        
        <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-5 text-sm font-medium text-slate-500">
                <Link to="/" className="underline-animate hover:text-indigo-600 cursor-pointer transition-colors decoration-none">Explore</Link>
                <Link to="/" className="text-indigo-600 cursor-pointer font-semibold relative after:absolute after:bottom-[-4px] after:left-0 after:w-full after:h-0.5 after:bg-indigo-600 after:rounded-full decoration-none">Planner</Link>
            </nav>

            {isAuthenticated ? (
              <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                    <UserIcon size={16} />
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{user?.name}</span>
                </div>
                <button 
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            ) : (
              <button 
                onClick={() => navigate('/signin')}
                className="elastic bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-lg text-sm font-semibold transition-all hover:shadow-lg hover:shadow-indigo-300 hover:-translate-y-0.5"
              >
                Get Started
              </button>
            )}
        </div>
      </div>
    </header>
  );
};