import { useState, useEffect } from 'react';
import { MapPin, Navigation, ArrowRight, LocateFixed, Loader2, User as UserIcon } from 'lucide-react';
import { NavigationBottomSheet } from './components/NavigationBottomSheet';
import { geocodePostcode, fetchRoute } from './services/routing';
import { fetchStationsNearRoute } from './services/stations';
import { trackEvent, trackPageView } from './services/analytics';
import polyline from '@mapbox/polyline';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Account } from './components/Account';
import { detectCountry } from './utils/postcode';
import { formatCurrency } from './utils/format';

import { Footer } from './components/Footer';
import { UKPriceTrend } from './components/UKPriceTrend';

function AppContent() {
  const { user, profile } = useAuth();
  const [view, setView] = useState<'home' | 'login' | 'account'>('home');
  const [startPostcode, setStartPostcode] = useState('');
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
  const [locating, setLocating] = useState(false);
  const [endPostcode, setEndPostcode] = useState('');
  const [fuelType, setFuelType] = useState<'petrol' | 'diesel'>('petrol');
  const [searchMode, setSearchMode] = useState<'route' | 'local'>('route');
  const [localSortBy, setLocalSortBy] = useState<'cheapest' | 'closest'>('cheapest');
  const [deviationRadius, setDeviationRadius] = useState<number>(804.672); // Default: 0.5 miles in meters
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [stats, setStats] = useState<{ maxPrice: number, avgPrice: number } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    trackPageView('Home');
  }, []);

  // Personalization Effect
  useEffect(() => {
    if (profile && !showResults && !loading) {
      if (profile.postcode) {
        setStartPostcode(profile.postcode);
      }
      if (profile.fuel_preference) {
        setFuelType(profile.fuel_preference as 'petrol' | 'diesel');
      }
      setSearchMode('local');
    }
  }, [profile]);

  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setStartPostcode('Current location');
        setLocating(false);
        trackEvent('use_my_location_success');
      },
      (error) => {
        console.error('Geolocation error:', error);
        setErrorMsg('Could not get your location. Please check permissions.');
        setLocating(false);
        trackEvent('use_my_location_failed', { error: error.message });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (showResults && results.length > 0) {
      const sorted = [...results];
      if (searchMode === 'local' && localSortBy === 'closest') {
        sorted.sort((a, b) => a.rawDistance - b.rawDistance);
      } else {
        sorted.sort((a, b) => a.price - b.price);
      }
      sorted.forEach(r => r.recommended = false);
      if (sorted.length > 0) sorted[0].recommended = true;
      setResults(sorted);
    }
  }, [localSortBy]);

  const handleSearch = async () => {
    if (!startPostcode) return;
    setLoading(true);
    setShowResults(false);
    setErrorMsg('');
    
    const isLocalSearch = !endPostcode;
    trackEvent('search_initiated', { fuelType, deviationRadius, isLocalSearch });
    
    try {
      let startCoords: [number, number] | null = null;
      if (startPostcode === 'Current location' && userCoords) {
        startCoords = [userCoords.lng, userCoords.lat];
      } else {
        startCoords = await geocodePostcode(startPostcode);
      }
      if (!startCoords) throw new Error('Could not find coordinates for start postcode');
      
      let routeGeometry = '';
      let effectiveRadius = deviationRadius;
      
      if (!isLocalSearch) {
        const endCoords = await geocodePostcode(endPostcode);
        if (!endCoords) throw new Error('Could not find coordinates for end postcode');
        
        const routeData = await fetchRoute(startCoords, endCoords);
        if (!routeData) throw new Error('Could not calculate route');
        routeGeometry = routeData.geometry;
      } else {
        const lat = startCoords[1];
        const lon = startCoords[0];
        routeGeometry = polyline.encode([[lat, lon], [lat + 0.0001, lon + 0.0001]]);
        effectiveRadius = deviationRadius === 0 ? 8046.72 : deviationRadius;
        if (localSortBy === 'closest') {
           effectiveRadius = 16093.4;
        }
      }

      const stations = await fetchStationsNearRoute(routeGeometry, fuelType, effectiveRadius);
      
      if (!stations || stations.length === 0) {
        setErrorMsg(isLocalSearch ? 'No stations found nearby.' : 'No stations found along this route.');
        setLoading(false);
        return;
      }
      
      const mappedResults = stations.map((st, i) => {
        const price = st.price || 0;
        let formattedDate = 'Unknown';
        if (st.recorded_at) {
          try {
            const date = new Date(st.recorded_at);
            const today = new Date();
            const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth() && date.getFullYear() === today.getFullYear();
            
            if (isToday) {
              formattedDate = `Today, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
            } else {
              formattedDate = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
            }
          } catch(e) {}
        }
        
        const isStale = false;
        
        return {
          id: st.site_id || i,
          isStale,
          brand: st.brand,
          address: st.postcode ? st.postcode : 'Unknown Location',
          price: price,
          lastUpdated: formattedDate,
          distance: st.distance_from_route ? `${(st.distance_from_route / 1609.34).toFixed(1)} miles away` : (isLocalSearch ? 'Nearby' : 'Near route'),
          recommended: i === 0,
          lat: st.location?.latitude,
          lng: st.location?.longitude,
          isMotorway: st.is_motorway === true,
          rawDistance: st.distance_from_route || 0,
          countryCode: st.country_code || 'GB'
        };
      }).filter((r: any) => r.price > 0);

      if (searchMode === 'local' && localSortBy === 'closest') {
        mappedResults.sort((a, b) => a.rawDistance - b.rawDistance);
      } else {
        mappedResults.sort((a, b) => a.price - b.price);
      }
      if (mappedResults.length > 0) {
        mappedResults[0].recommended = true;
      }
      
      let maxPrice = 0;
      let avgPrice = 0;
      
      if (searchMode === 'local') {
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
        try {
            const histRes = await fetch(`${supabaseUrl}/rest/v1/uk_price_history?select=*&order=date.desc&limit=1`, {
                headers: { 'apikey': anonKey, 'Authorization': `Bearer ${anonKey}` }
            });
            if (histRes.ok) {
                const histData = await histRes.json();
                if (histData && histData.length > 0) {
                    const rawMax = fuelType === 'diesel' ? histData[0].diesel_high : histData[0].petrol_high;
                    const rawAvg = fuelType === 'diesel' ? histData[0].diesel_avg : histData[0].petrol_avg;
                    maxPrice = Math.floor(Number(rawMax)) + 0.9;
                    avgPrice = Math.floor(Number(rawAvg)) + 0.9;
                }
            }
        } catch (e) {}
        
        if (maxPrice === 0 && mappedResults.length > 0) {
           maxPrice = mappedResults[0].price + 15;
           avgPrice = mappedResults[0].price + 5;
        }
      } else if (mappedResults.length > 1) {
        const prices = mappedResults.filter(r => !r.isStale).map(r => r.price).filter(p => p > 0);
        maxPrice = Math.max(...prices);
        avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
      }

      if (maxPrice > 0) {
        setStats({ maxPrice, avgPrice });
      } else {
        setStats(null);
      }

      setResults(mappedResults);
      setShowResults(true);
      trackEvent('search_completed', { resultCount: mappedResults.length });
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during search');
      trackEvent('search_failed', { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  if (view === 'login') return (
    <Login 
      onBack={() => setView('home')} 
      onSuccess={(mode) => setView(mode === 'signup' ? 'account' : 'home')} 
    />
  );
  if (view === 'account') return <Account onBack={() => setView('home')} />;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500/30 pb-20">
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 pt-[max(0.75rem,env(safe-area-inset-top))] sticky top-0 z-[100] shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between relative px-6 pb-3">
          <div className="w-10 h-10"></div>
          <h1 className="text-3xl font-black font-display tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-100 to-emerald-500 uppercase">
            Pumpprice
          </h1>
          <button 
            onClick={() => user ? setView('account') : setView('login')}
            className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <UserIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="w-full bg-gradient-to-r from-blue-600/20 via-slate-800/50 to-red-600/20 border-t border-slate-800/50 py-1.5 text-center shadow-inner">
          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300 flex items-center justify-center gap-3">
            <span className="text-xs leading-none animate-pulse">🇫🇷</span> Now tracking French fuel stations! <span className="text-xs leading-none animate-pulse">🇫🇷</span>
          </span>
        </div>
      </header>
      <main className="max-w-md mx-auto py-6 space-y-3">

        <div className="text-center mb-4 px-8">
          <p className="text-base sm:text-lg font-extrabold text-white leading-snug tracking-tight">
            {searchMode === 'route' ? (
              <>Find the <span className={`underline decoration-2 underline-offset-4 transition-colors duration-500 ${fuelType === 'diesel' ? 'decoration-sky-400' : 'decoration-emerald-400'}`}>cheapest</span> real-time fuel prices along your planned journey.</>
            ) : (
              <>Find the absolute <span className={`underline decoration-2 underline-offset-4 transition-colors duration-500 ${fuelType === 'diesel' ? 'decoration-sky-400' : 'decoration-emerald-400'}`}>cheapest</span> or closest fuel near any UK or French postcode.</>
            )}
          </p>
        </div>
        <section className={`mx-6 p-6 rounded-3xl border-2 overflow-hidden space-y-6 relative transition-all duration-500 bg-gradient-to-b from-slate-800/80 to-slate-900 shadow-2xl ${fuelType === 'diesel' ? 'border-sky-500/40 shadow-sky-500/20' : 'border-emerald-500/40 shadow-emerald-500/20'}`}>
          <div className={`absolute -top-24 -left-24 w-72 h-72 rounded-full mix-blend-screen filter blur-[80px] opacity-20 pointer-events-none transition-colors duration-700 ${fuelType === 'diesel' ? 'bg-sky-500' : 'bg-emerald-500'}`}></div>
          
          <div className="flex bg-slate-950 p-1.5 rounded-2xl border border-slate-800 shadow-inner relative z-10">
            <button
              onClick={() => {
                setSearchMode('route');
                setShowResults(false);
              }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${searchMode === 'route' ? 'bg-slate-800 text-white shadow-md border border-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Route Search
            </button>
            <button
              onClick={() => {
                setSearchMode('local');
                setShowResults(false);
                setEndPostcode('');
              }}
              className={`flex-1 py-2.5 text-sm font-bold rounded-xl transition-all ${searchMode === 'local' ? 'bg-slate-800 text-white shadow-md border border-slate-700' : 'text-slate-500 hover:text-slate-300'}`}
            >
              Local Search
            </button>
          </div>

          <div className="space-y-4 relative z-10">
            {searchMode === 'route' && <div className="absolute left-[19px] top-[24px] bottom-[24px] w-[2px] bg-slate-800 z-0"></div>}

            <div className="relative z-10 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_currentColor] ${fuelType === 'diesel' ? 'bg-sky-500 text-sky-500' : 'bg-emerald-500 text-emerald-500'}`}></div>
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 block">{searchMode === 'route' ? 'Start Postcode (UK or FR)' : 'Your Postcode (UK or FR)'}</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="e.g. SW1A 1AA" 
                    className={`w-full bg-slate-950/80 backdrop-blur border border-slate-700 rounded-xl px-4 py-3 pr-12 text-base outline-none ${startPostcode === 'Current location' ? (fuelType === 'diesel' ? 'text-sky-400' : 'text-emerald-400') + ' font-bold normal-case' : 'text-white uppercase'} placeholder-slate-500 transition-all focus:ring-2 ${fuelType === 'diesel' ? 'focus:border-sky-400 focus:ring-sky-500/30' : 'focus:border-emerald-400 focus:ring-emerald-500/30'}`}
                    value={startPostcode}
                    onChange={e => {
                      setStartPostcode(e.target.value);
                      if (userCoords) setUserCoords(null);
                    }}
                    onFocus={() => {
                      if (startPostcode === 'Current location') {
                        setStartPostcode('');
                        setUserCoords(null);
                      }
                    }}
                  />
                  <button
                    onClick={handleUseMyLocation}
                    disabled={locating}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 transition-colors ${fuelType === "diesel" ? "hover:text-sky-400" : "hover:text-emerald-400"}`}
                    title="Use my location"
                  >
                    {locating ? <Loader2 className="w-5 h-5 animate-spin" /> : <LocateFixed className={`w-5 h-5 ${startPostcode === 'Current location' ? (fuelType === 'diesel' ? 'text-sky-400' : 'text-emerald-400') : ''}`} />}
                  </button>
                </div>
              </div>
            </div>
            
            {searchMode === 'route' && (
            <div className="relative z-10 flex items-center gap-4 animate-in slide-in-from-top-2 fade-in duration-300">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                <MapPin className="w-4 h-4 text-rose-500" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1 block">End Postcode (UK or FR)</label>
                <input 
                  type="text" 
                  placeholder="e.g. BS1 5TR" 
                  className={`w-full bg-slate-950/80 backdrop-blur border border-slate-700 rounded-xl px-4 py-3 text-base outline-none text-white placeholder-slate-500 transition-all uppercase focus:ring-2 ${fuelType === 'diesel' ? 'focus:border-sky-400 focus:ring-sky-500/30' : 'focus:border-emerald-400 focus:ring-emerald-500/30'}`}
                  value={endPostcode}
                  onChange={e => setEndPostcode(e.target.value)}
                />
              </div>
            </div>
            )}
          </div>

          <div className="pt-2 relative z-10">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-3">Fuel Type</label>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => {
                  setFuelType('petrol');
                  if (startPostcode && showResults) setTimeout(() => document.getElementById('search-btn')?.click(), 50);
                }}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${fuelType === 'petrol' ? 'bg-emerald-500 text-slate-50 shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Petrol (E10)
              </button>
              <button
                onClick={() => {
                  setFuelType('diesel');
                  if (startPostcode && showResults) setTimeout(() => document.getElementById('search-btn')?.click(), 50);
                }}
                className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${fuelType === 'diesel' ? 'bg-sky-500 text-slate-50 shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Diesel (B7)
              </button>
            </div>
          </div>

          {searchMode === 'local' && (
            <div className="pt-2 animate-in slide-in-from-top-2 fade-in duration-300 relative z-10">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 block">Sort Results By</label>
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setLocalSortBy('cheapest')}
                  className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${localSortBy === 'cheapest' ? (fuelType === 'diesel' ? 'bg-sky-500 text-slate-50' : 'bg-emerald-500 text-slate-50') : 'text-slate-400 hover:text-white'}`}
                >
                  Cheapest Price
                </button>
                <button
                  onClick={() => setLocalSortBy('closest')}
                  className={`flex-1 py-2.5 text-xs sm:text-sm font-bold rounded-lg transition-all ${localSortBy === 'closest' ? (fuelType === 'diesel' ? 'bg-sky-500 text-slate-50' : 'bg-emerald-500 text-slate-50') : 'text-slate-400 hover:text-white'}`}
                >
                  Closest Distance
                </button>
              </div>
            </div>
          )}
          
          {(searchMode === 'route' || localSortBy === 'cheapest') && (
          <div className="pt-4 relative z-10">
            <div className="flex justify-between items-end mb-3">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">{endPostcode ? 'Max Detour Distance' : 'Search Radius'}</label>
              <span className={`text-sm font-bold ${fuelType === 'diesel' ? 'text-sky-400' : 'text-emerald-400'}`}>{deviationRadius === 0 ? 'On Route' : `${(deviationRadius / 1609.34).toFixed(1)} miles`}</span>
            </div>
            <div className="relative pt-2 pb-6 px-1">
              <input 
                type="range" min="0" max="4" step="1" 
                className={`w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 ${fuelType === "diesel" ? "focus:ring-sky-500/50 [&::-webkit-slider-thumb]:bg-sky-500" : "focus:ring-emerald-500/50 [&::-webkit-slider-thumb]:bg-emerald-500"} [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg`}
                style={{ background: `linear-gradient(to right, ${fuelType === 'diesel' ? '#0ea5e9' : '#10b981'} 0%, ${fuelType === 'diesel' ? '#0ea5e9' : '#10b981'} ${([0, 804.672, 1609.34, 4023.36, 8046.72].indexOf(deviationRadius) / 4) * 100}%, #1e293b ${([0, 804.672, 1609.34, 4023.36, 8046.72].indexOf(deviationRadius) / 4) * 100}%, #1e293b 100%)` }}
                value={[0, 804.672, 1609.34, 4023.36, 8046.72].indexOf(deviationRadius)}
                onChange={(e) => {
                  const values = [0, 804.672, 1609.34, 4023.36, 8046.72];
                  setDeviationRadius(values[parseInt(e.target.value)]);
                  if (startPostcode && showResults) setTimeout(() => document.getElementById('search-btn')?.click(), 50);
                }}
              />
            </div>
          </div>
          )}

          {errorMsg && <div className="bg-rose-500/20 text-rose-300 p-3 rounded-lg text-sm border border-rose-500/30">{errorMsg}</div>}

          <button 
            id="search-btn" onClick={handleSearch} disabled={loading || !startPostcode || (searchMode === 'route' && !endPostcode)}
            className={`w-full mt-6 relative z-10 ${fuelType === 'diesel' ? 'bg-sky-500 hover:bg-sky-400' : 'bg-emerald-500 hover:bg-emerald-400'} text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${(loading || !startPostcode || (searchMode === 'route' && !endPostcode)) ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {loading ? <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" /> : <>{searchMode === 'route' ? 'Find Cheapest Route' : 'Find Local Prices'} <ArrowRight className="w-5 h-5" /></>}
          </button>
        </section>

        {showResults && results.length > 0 && (
          <section className="space-y-4 animate-in mx-6 slide-in-from-bottom-4 fade-in duration-500">
            <h2 className="text-lg font-black text-white flex items-center gap-2 mb-2">{endPostcode ? 'Best Options on Route' : 'Best Local Options'}</h2>
            <div className="space-y-4">
              {results.filter(s => !s.isStale).map((station, index) => (
                <div key={station.id} className="space-y-4">
                  <div className="flex flex-col">
                    <div 
                      className={`relative bg-slate-900 p-5 border transition-all ${fuelType === 'diesel' ? 'hover:border-sky-500/50' : 'hover:border-emerald-500/50'} ${index === 0 ? (fuelType === 'diesel' ? 'rounded-t-2xl border-sky-500/30 shadow-lg shadow-sky-500/10' : 'rounded-t-2xl border-emerald-500/30 shadow-lg shadow-emerald-500/10') : 'rounded-2xl border-slate-800'}`}>
                      {index === 0 && <div className={`absolute -top-3 right-4 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm ${fuelType === "diesel" ? "bg-sky-500" : "bg-emerald-500"}`}>{searchMode === 'local' && localSortBy === 'closest' ? 'Closest' : 'Cheapest'}</div>}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm grayscale-[0.2]">{station.countryCode === 'FR' ? '🇫🇷' : '🇬🇧'}</span>
                            <h3 className="font-bold text-lg text-white">{station.brand}</h3>
                            {station.isMotorway && <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-amber-500/30">Motorway</span>}
                          </div>                          <p className="text-sm text-slate-400 mt-0.5">{station.address}</p>
                          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1"><Navigation className="w-3 h-3" /> {station.distance}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-baseline gap-0.5 justify-end">
                            {station.countryCode === 'GB' ? (
                              <>
                                <span className={`text-3xl font-black tracking-tighter ${index === 0 ? (fuelType === 'diesel' ? 'text-sky-400' : 'text-emerald-400') : 'text-slate-200'}`}>
                                  {Math.floor(station.price)}.9
                                </span>
                                <span className="text-sm font-semibold text-slate-500">p</span>
                              </>
                            ) : (                              <>
                                <span className="text-sm font-bold text-slate-500 mr-1">€</span>
                                <span className={`text-3xl font-black tracking-tighter ${index === 0 ? (fuelType === 'diesel' ? 'text-sky-400' : 'text-emerald-400') : 'text-slate-200'}`}>
                                  {(station.price / 100).toFixed(2)}
                                </span>
                              </>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500/80 font-medium mt-1 pr-1">Price changed:  {station.lastUpdated}</div>
                        </div>                      </div>
                      <button onClick={() => setSelectedStation(station)} className="w-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700"><MapPin className={`w-4 h-4 ${fuelType === 'diesel' ? 'text-sky-400' : 'text-emerald-400'}`} /> Navigate Here</button>
                    </div>
                    {index === 0 && stats && (
                      <div className={`bg-gradient-to-br border-l border-r border-b rounded-b-2xl p-4 flex flex-col gap-3 ${fuelType === "diesel" ? "from-sky-500/10 to-blue-500/5 border-sky-500/20" : "from-emerald-500/10 to-teal-500/5 border-emerald-500/20"}`}>
                        <div className="flex justify-between items-center text-sm"><span className={`font-medium ${fuelType === "diesel" ? "text-sky-300/80" : "text-emerald-300/80"}`}>{searchMode === 'local' ? 'vs. National Highest:' : 'vs. Most Expensive:'}</span><span className={`${fuelType === 'diesel' ? 'text-sky-400' : 'text-emerald-400'} font-bold`}>{(stats.maxPrice - station.price).toFixed(1)}{station.countryCode === 'GB' ? 'p' : 'c'} / L cheaper</span></div>
                        <div className="flex justify-between items-center text-sm"><span className={`font-medium ${fuelType === "diesel" ? "text-sky-300/80" : "text-emerald-300/80"}`}>{searchMode === 'local' ? 'vs. National Average:' : (endPostcode ? 'vs. Route Average:' : 'vs. Local Average:')}</span><span className={`${fuelType === 'diesel' ? 'text-sky-400' : 'text-emerald-400'} font-bold`}>{(stats.avgPrice - station.price).toFixed(1)}{station.countryCode === 'GB' ? 'p' : 'c'} / L cheaper</span></div>                        <div className={`pt-3 border-t mt-1 flex justify-between items-end ${fuelType === "diesel" ? "border-sky-500/10" : "border-emerald-500/10"}`}>
                          <div className="text-xs text-slate-400 max-w-[60%]">Estimated savings on a full 60L tank vs max</div>
                          <div className={`text-xl font-black tracking-tight ${fuelType === 'diesel' ? 'text-sky-400' : 'text-emerald-400'}`}>
                            {station.countryCode === 'GB' ? (
                              <>Save £{(((stats.maxPrice - station.price) * 60) / 100).toFixed(2)}</>
                            ) : (
                              <>Save €{(((stats.maxPrice - station.price) * 60) / 100).toFixed(2)}</>
                            )}
                          </div>
                        </div>                      </div>
                    )}
                  </div>
                </div>
              ))}
              {results.filter(s => s.isStale).length > 0 && <div className="mt-8 mb-2"><h2 className="text-xl font-bold text-slate-300 px-1 border-b border-slate-800 pb-2">Fuel stations with stale data</h2></div>}
              {results.filter(s => s.isStale).map((station) => (
                <div key={station.id} className="space-y-4 opacity-75">
                  <div className="flex flex-col"><div className="relative bg-slate-900/50 p-5 border border-slate-800/50 rounded-2xl"><div className="flex justify-between items-start"><div><div className="flex items-center gap-2"><h3 className="font-bold text-lg text-slate-400">{station.brand}</h3>{station.isMotorway && <span className="bg-amber-500/10 text-amber-500/50 text-[10px] font-bold px-2 py-0.5 rounded uppercase border border-amber-500/20">Motorway</span>}</div><p className="text-sm text-slate-500 mt-0.5">{station.address}</p><p className="text-xs text-slate-600 mt-2 flex items-center gap-1"><Navigation className="w-3 h-3" /> {station.distance}</p></div><div className="text-right flex flex-col items-end"><div className="h-8"></div><div className="text-[10px] text-slate-600 font-medium mt-1 pr-1">Price changed:  {station.lastUpdated}</div></div></div></div></div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
      <UKPriceTrend /><Footer />
      <NavigationBottomSheet isOpen={!!selectedStation} onClose={() => setSelectedStation(null)} station={selectedStation} startPostcode={startPostcode} endPostcode={endPostcode} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
