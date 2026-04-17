import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { createClient } from '@supabase/supabase-js';
import { User, MapPin, Fuel, Loader2, LogOut, ArrowRight, Save } from 'lucide-react';
import { geocodePostcode } from '../services/routing';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

interface AccountProps {
  onBack: () => void;
}

export const Account: React.FC<AccountProps> = ({ onBack }) => {
  const { user, profile, signOut, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.name || '');
  const [postcode, setPostcode] = useState(profile?.postcode || '');
  const [fuelPreference, setFuelPreference] = useState<'petrol' | 'diesel'>(profile?.fuel_preference || 'petrol');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setPostcode(profile.postcode || '');
      setFuelPreference(profile.fuel_preference || 'petrol');
    }
  }, [profile]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ type: '', text: '' });

    try {
      let lat = profile?.home_lat;
      let lng = profile?.home_lng;

      if (postcode && postcode !== profile?.postcode) {
        const coords = await geocodePostcode(postcode);
        if (coords) {
          lng = coords[0];
          lat = coords[1];
        } else {
          throw new Error('Invalid postcode. Please check and try again.');
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          name,
          postcode: postcode.toUpperCase(),
          home_lat: lat,
          home_lng: lng,
          fuel_preference: fuelPreference,
          updated_at: new Date().toISOString()
        })
        .eq('id', user?.id);

      if (error) throw error;
      
      await refreshProfile();
      setMsg({ type: 'success', text: 'Profile updated successfully!' });
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500/30">
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sticky top-0 z-[100] shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between relative px-6">
                    <button 
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
          </button>
          <h1 className="text-3xl font-black font-display tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-100 to-emerald-500 uppercase">
            Pumpprice
          </h1>
          <div className="w-10 h-10"></div>
        </div>
      </header>
      <div className="max-w-md mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-8 shadow-2xl">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-black text-white">My Account</h2>
            <p className="text-slate-400 text-sm mt-1">{user?.email}</p>
          </div>
          <button 
            onClick={() => {
              signOut();
              onBack();
            }}
            className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
            title="Log Out"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>

        {msg.text && (
          <div className={`p-4 rounded-xl mb-6 text-sm border ${msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
            {msg.text}
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Display Name</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                placeholder="Your Name"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 text-white outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Local Postcode</label>
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="text" 
                placeholder="e.g. SW1A 1AA"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 text-white outline-none uppercase focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                value={postcode}
                onChange={e => setPostcode(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 block">Default Fuel Preference</label>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setFuelPreference('petrol')}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${fuelPreference === 'petrol' ? 'bg-emerald-500 text-slate-50 shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Petrol (E10)
              </button>
              <button
                type="button"
                onClick={() => setFuelPreference('diesel')}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${fuelPreference === 'diesel' ? 'bg-sky-500 text-slate-50 shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Diesel (B7)
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-slate-950 font-bold py-4 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors mt-8 shadow-xl"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Save Changes</>}
          </button>
        </form>
      </div>
    </div>
      </div>
);
};
