import { Helmet } from 'react-helmet-async';
import { useParams, Navigate } from 'react-router-dom';
import { localData } from '../content/localData';
import { useState, useEffect } from 'react';
import { MapPin, Navigation, ArrowRight } from 'lucide-react';
import { NavigationBottomSheet } from '../components/NavigationBottomSheet';
import { geocodePostcode, fetchRoute } from '../services/routing';
import { fetchStationsNearRoute, fetchCityStats } from '../services/stations';
import { formatCurrency } from '../utils/format';
import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { SavingsCalculator } from '../components/SavingsCalculator';
import { LocalLeaderboard } from '../components/LocalLeaderboard';

export default function LocalCity() {
  const { slug } = useParams<{ slug: string }>();
  
  let baseSlug = slug;
  let initialFuelType: 'petrol' | 'diesel' = 'petrol';
  
  if (slug?.includes('-petrol-')) {
    baseSlug = slug.replace('-petrol-', '-fuel-');
    initialFuelType = 'petrol';
  } else if (slug?.includes('-diesel-')) {
    baseSlug = slug.replace('-diesel-', '-fuel-');
    initialFuelType = 'diesel';
  }

  const cityData = baseSlug ? (localData as any)[baseSlug] : null;

  const [endPostcode, setEndPostcode] = useState('');
  const [fuelType, setFuelType] = useState<'petrol' | 'diesel'>(initialFuelType);
  const [deviationRadius, setDeviationRadius] = useState<number>(804.672); // Default: 0.5 miles
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedStation, setSelectedStation] = useState<any>(null);
  const [results, setResults] = useState<any[]>([]);
  const [stats, setStats] = useState<{ maxPrice: number, avgPrice: number } | null>(null);
  const [cityStats, setCityStats] = useState<{ petrol: any, diesel: any, petrolStations?: any[], dieselStations?: any[] } | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!cityData) return;
    
    // Fetch background stats for the 5-mile radius (8046.72m)
    fetchCityStats(cityData.postcode, 8046.72).then(res => {
      if (res) setCityStats(res);
    });
  }, [slug, cityData]);

  if (!cityData) {
    return <Navigate to="/" replace />;
  }

  const handleSearch = async () => {
    if (!cityData.postcode || !endPostcode) return;
    setLoading(true);
    setShowResults(false);
    setErrorMsg('');
    
    try {
      const startCoords = await geocodePostcode(cityData.postcode);
      const endCoords = await geocodePostcode(endPostcode);
      
      if (!startCoords || !endCoords) throw new Error('Could not find coordinates for postcodes');

      const routeData = await fetchRoute(startCoords, endCoords);
      if (!routeData) throw new Error('Could not calculate route');

      const stations = await fetchStationsNearRoute(routeData.geometry, fuelType, deviationRadius);
      
      if (!stations || stations.length === 0) {
        setErrorMsg('No stations found along this route.');
        setLoading(false);
        return;
      }
      
      const mappedResults = stations.map((st: any, i: number) => {
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
          distance: st.distance_from_route ? `${(st.distance_from_route / 1609.34).toFixed(1)} miles off route` : 'Near route',
          recommended: i === 0,
          lat: st.location?.latitude,
          lng: st.location?.longitude,
          isMotorway: st.is_motorway === true,
          countryCode: st.country_code || 'GB'
        };
      }).filter((r: any) => r.price > 0);

      mappedResults.sort((a: any, b: any) => a.price - b.price);
      if (mappedResults.length > 0) mappedResults[0].recommended = true;
      
      if (mappedResults.length > 1) {
        const prices = mappedResults.filter(r => !r.isStale).map(r => r.price).filter(p => p > 0);
        const maxPrice = Math.floor(Math.max(...prices)) + 0.9;
        const avgPrice = Math.floor(prices.reduce((a, b) => a + b, 0) / prices.length) + 0.9;
        setStats({ maxPrice, avgPrice });
      } else {
        setStats(null);
      }

      setResults(mappedResults);
      setShowResults(true);
      
      if (typeof window !== "undefined" && (window as any).posthog) {
        (window as any).posthog.capture("search_completed_local", { city: cityData.h1, endPostcode: endPostcode, fuelType: fuelType, resultCount: mappedResults.length });
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An error occurred during search');
      if (typeof window !== "undefined" && (window as any).posthog) {
        (window as any).posthog.capture("search_failed_local", { city: cityData.h1, error: err.message });
      }
    } finally {
      setLoading(false);
    }
  };

  const cityName = cityData.h1.replace('Cheapest Fuel in ', '');
  
  let dynamicTitle = `${cityData.title} | Pumpprice`;
  let dynamicDescription = cityData.description;
  let pageHeading = `Cheapest Petrol & Diesel in ${cityName}`;

  if (slug?.includes('-petrol-')) {
    dynamicTitle = `Cheapest Petrol Prices in ${cityName} | Live Updates | PumpPrice`;
    pageHeading = `Cheapest Petrol in ${cityName}`;
    if (cityStats && cityStats.petrol) {
      dynamicDescription = `Find the cheapest petrol in ${cityName} today. Prices start at ${cityStats.petrol.min}p. Compare live E10 prices without taking a detour.`;
    } else {
      dynamicDescription = `Find the cheapest unleaded petrol in ${cityName} today. Compare live forecourt prices updated from the CMA Fuel Finder Open Data Scheme.`;
    }
  } else if (slug?.includes('-diesel-')) {
    dynamicTitle = `Cheapest Diesel Prices in ${cityName} | Live Updates | PumpPrice`;
    pageHeading = `Cheapest Diesel in ${cityName}`;
    if (cityStats && cityStats.diesel) {
      dynamicDescription = `Find the cheapest diesel in ${cityName} today. Prices start at ${cityStats.diesel.min}p. Compare live B7 prices without taking a detour.`;
    } else {
      dynamicDescription = `Find the cheapest diesel in ${cityName} today. Compare live forecourt prices updated from the CMA Fuel Finder Open Data Scheme.`;
    }
  } else {
    if (cityStats && cityStats.petrol && cityStats.diesel) {
      dynamicDescription = `Find the cheapest fuel in ${cityName} today. Petrol starts at ${cityStats.petrol.min}p and Diesel at ${cityStats.diesel.min}p. Compare live prices without taking a detour.`;
    } else if (cityStats && cityStats.petrol) {
      dynamicDescription = `Find the cheapest petrol in ${cityName} today. Prices start at ${cityStats.petrol.min}p. Compare live E10 prices without taking a detour.`;
    }
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": `What is the cheapest petrol in ${cityName} today?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": cityStats?.petrol ? `The cheapest petrol (E10) is currently ${cityStats.petrol.min}p.` : `Check our live map for the cheapest petrol prices today.`
        }
      },
      {
        "@type": "Question",
        "name": `What is the cheapest diesel in ${cityName} today?`,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": cityStats?.diesel ? `The cheapest diesel (B7) is currently ${cityStats.diesel.min}p.` : `Check our live map for the cheapest diesel prices today.`
        }
      }
    ]
  };

  const datasetSchema = {
    "@context": "https://schema.org/",
    "@type": "Dataset",
    "name": `Live Fuel Prices in ${cityName}`,
    "description": `Real-time petrol and diesel prices for ${cityName}, UK, aggregated from the CMA open data feed.`,
    "url": `https://pumpprice.live/city/${slug}`,
    "sameAs": `https://pumpprice.live/city/${slug}`,
    "keywords": [
      "fuel prices",
      "petrol prices",
      "diesel prices",
      cityName,
      "UK"
    ],
    "creator": {
      "@type": "Organization",
      "name": "Pumpprice.live"
    },
    "includedInDataCatalog": {
      "@type": "DataCatalog",
      "name": "UK CMA Open Fuel Data"
    },
    "distribution": [
      {
        "@type": "DataDownload",
        "encodingFormat": "text/html",
        "contentUrl": `https://pumpprice.live/city/${slug}`
      }
    ],
    "dateModified": new Date().toISOString()
  };

  const canonicalUrl = `https://pumpprice.live/city/${slug}`;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500/30 pb-20">
      <Helmet>
        <title>{dynamicTitle}</title>
        <meta name="description" content={dynamicDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={dynamicTitle} />
        <meta property="og:description" content={dynamicDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="twitter:title" content={dynamicTitle} />
        <meta property="twitter:description" content={dynamicDescription} />
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
        <script type="application/ld+json">
          {JSON.stringify(datasetSchema)}
        </script>
      </Helmet>
      <header className="bg-slate-900 border-b border-slate-800 px-6 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sticky top-0 z-50 shadow-sm flex justify-center">
        <Link to="/" className="text-3xl font-black font-display tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-100 to-emerald-500 uppercase hover:opacity-80 transition-opacity">
            Pumpprice
        </Link>
      </header>

      <main className="max-w-md mx-auto px-6 py-6 space-y-4">
        
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-white mb-6 uppercase tracking-tight">{pageHeading}</h1>
        </div>

<p className="text-slate-400 text-sm font-medium px-2 pb-4 text-center">
            Driving out of {cityData.h1.replace('Cheapest Fuel in ', '')}? Enter your destination to see live prices from every petrol station along your planned route.
          </p>

        <section className="space-y-6 bg-slate-900/50 p-6 rounded-3xl border border-slate-800 shadow-xl">
          <div className="space-y-4 relative">
            <div className="absolute left-[19px] top-[24px] bottom-[24px] w-[2px] bg-slate-800 z-0"></div>

            <div className="relative z-10 flex items-center gap-4 opacity-70">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">Start Location</label>
                <input 
                  type="text" 
                  disabled
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-base text-slate-500 cursor-not-allowed font-bold"
                  value={cityData.h1.replace('Cheapest Fuel in ', '') + ' (Center)'}
                />
              </div>
            </div>
            
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center flex-shrink-0 shadow-sm">
                <MapPin className="w-4 h-4 text-rose-500" />
              </div>
              <div className="flex-1">
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1 block">End Postcode (UK or FR)</label>
                <input 
                  type="text" 
                  placeholder="e.g. BS1 5TR" 
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-base focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-white placeholder-slate-600 transition-all uppercase"
                  value={endPostcode}
                  onChange={e => setEndPostcode(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="pt-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 block">Fuel Type</label>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => {
                  setFuelType('petrol');
                  if (showResults) {
                    setTimeout(() => document.getElementById('search-btn')?.click(), 50);
                  }
                }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${fuelType === 'petrol' ? 'bg-emerald-500 text-slate-50 shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Petrol (E10)
              </button>
              <button
                onClick={() => {
                  setFuelType('diesel');
                  if (showResults) {
                    setTimeout(() => document.getElementById('search-btn')?.click(), 50);
                  }
                }}
                className={`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all ${fuelType === 'diesel' ? 'bg-sky-500 text-slate-50 shadow-md' : 'text-slate-400 hover:text-white'}`}
              >
                Diesel (B7)
              </button>
            </div>
          </div>

          <div className="pt-4">
            <div className="flex justify-between items-end mb-3">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Max Detour Distance</label>
              <span className={`text-sm font-bold ${fuelType === 'diesel' ? 'text-sky-400' : 'text-emerald-400'}`}>{deviationRadius === 0 ? 'On Route' : `${(deviationRadius / 1609.34).toFixed(1)} miles`}</span>
            </div>
            
            <div className="relative pt-2 pb-6 px-1">
              <input 
                type="range" 
                min="0" 
                max="4" 
                step="1" 
                className={`w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 ${fuelType === "diesel" ? "focus:ring-sky-500/50 [&::-webkit-slider-thumb]:bg-sky-500 [&::-moz-range-thumb]:bg-sky-500 active:[&::-webkit-slider-thumb]:bg-sky-400 active:[&::-moz-range-thumb]:bg-sky-400" : "focus:ring-emerald-500/50 [&::-webkit-slider-thumb]:bg-emerald-500 [&::-moz-range-thumb]:bg-emerald-500 active:[&::-webkit-slider-thumb]:bg-emerald-400 active:[&::-moz-range-thumb]:bg-emerald-400"} [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-7 [&::-webkit-slider-thumb]:h-7 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-lg [&::-moz-range-thumb]:appearance-none [&::-moz-range-thumb]:w-7 [&::-moz-range-thumb]:h-7 [&::-moz-range-thumb]:border-none [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:shadow-lg`}
                style={{
                  background: `linear-gradient(to right, ${fuelType === 'diesel' ? '#0ea5e9' : '#10b981'} 0%, ${fuelType === 'diesel' ? '#0ea5e9' : '#10b981'} ${(
                    [0, 804.672, 1609.34, 4023.36, 8046.72].indexOf(deviationRadius) / 4
                  ) * 100}%, #1e293b ${(
                    [0, 804.672, 1609.34, 4023.36, 8046.72].indexOf(deviationRadius) / 4
                  ) * 100}%, #1e293b 100%)`
                }}
                value={[0, 804.672, 1609.34, 4023.36, 8046.72].indexOf(deviationRadius)}
                onChange={(e) => {
                  const valIndex = parseInt(e.target.value);
                  const values = [0, 804.672, 1609.34, 4023.36, 8046.72];
                  setDeviationRadius(values[valIndex]);
                  
                  if (endPostcode && showResults) {
                    setTimeout(() => { document.getElementById('search-btn')?.click(); }, 50);
                  }
                }}
              />
              <div className="flex justify-between text-[10px] font-medium text-slate-500 mt-2 absolute w-full left-0 px-2">
                <span>0m</span>
                <span>0.5m</span>
                <span>1m</span>
                <span>2.5m</span>
                <span>5m</span>
              </div>
            </div>
          </div>

          {errorMsg && (
            <div className="bg-rose-500/20 text-rose-300 p-3 rounded-lg text-sm border border-rose-500/30">
              {errorMsg}
            </div>
          )}

          <button 
            id="search-btn"
            onClick={handleSearch}
            disabled={loading || !endPostcode}
            className={`w-full ${fuelType === 'diesel' ? 'bg-sky-500 hover:bg-sky-400 shadow-sky-500/20' : 'bg-emerald-500 hover:bg-emerald-400 shadow-emerald-500/20'} text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98] ${loading || !endPostcode ? 'opacity-50 cursor-not-allowed shadow-none' : ''}`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin" />
            ) : (
              <>
                Find Cheapest {fuelType === 'petrol' ? 'Petrol' : 'Diesel'} <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </section>

        <div className="text-center space-y-2 mt-8">

          
          {/* City Stats Module */}
          {cityStats && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 mb-8 text-left shadow-2xl">
              <h2 className="text-lg font-bold text-slate-300 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-400" />
                Live Fuel Prices in {cityData.h1.replace('Cheapest Fuel in ', '')}
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                {/* Petrol Stats */}
                {cityStats.petrol && (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/50">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Petrol (E10)</div>
                    <div className="text-2xl min-[380px]:text-3xl font-black text-emerald-400 tracking-tighter mb-1 flex flex-wrap items-baseline gap-x-1">{Math.floor(Number(cityStats.petrol.avg))}<span>.9</span>p <span className="text-sm text-slate-500 font-medium">Avg</span></div>
                    <div className="flex justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800">
                      <span>Low: <strong className="text-white">{cityStats.petrol.min}p</strong></span>
                      <span>High: <strong className="text-white">{cityStats.petrol.max}p</strong></span>
                    </div>
                  </div>
                )}
                
                {/* Diesel Stats */}
                {cityStats.diesel && (
                  <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/50">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Diesel (B7)</div>
                    <div className="text-2xl min-[380px]:text-3xl font-black text-sky-400 tracking-tighter mb-1 flex flex-wrap items-baseline gap-x-1">{Math.floor(Number(cityStats.diesel.avg))}<span>.9</span>p <span className="text-sm text-slate-500 font-medium">Avg</span></div>
                    <div className="flex justify-between text-xs text-slate-400 mt-3 pt-3 border-t border-slate-800">
                      <span>Low: <strong className="text-white">{cityStats.diesel.min}p</strong></span>
                      <span>High: <strong className="text-white">{cityStats.diesel.max}p</strong></span>
                    </div>
                  </div>
                )}
              </div>
              <p className="text-[10px] text-slate-500 mt-4 text-center">
                Averaged across {cityStats.petrol ? cityStats.petrol.count : 0} stations within a 5-mile radius.
              </p>
            </div>
          )}

          {cityStats && cityStats[fuelType] && (
            <div className="mb-8 text-left">
              <SavingsCalculator 
                cityName={cityName}
                fuelType={fuelType}
                cheapestPrice={Number(cityStats[fuelType].min)}
                averagePrice={Number(cityStats[fuelType].avg)}
                maxPrice={Number(cityStats[fuelType].max)}
              />
            </div>
          )}

          {cityStats && cityStats[fuelType === 'petrol' ? 'petrolStations' : 'dieselStations'] && (
            <div className="mb-8 text-left">
              <LocalLeaderboard 
                cityName={cityName}
                fuelType={fuelType}
                stations={cityStats[fuelType === 'petrol' ? 'petrolStations' : 'dieselStations'] || []}
              />
            </div>
          )}


        </div>


        

        {showResults && results.length > 0 && (
          <section className="space-y-4 animate-in slide-in-from-bottom-4 fade-in duration-500">
            <h2 className="text-lg font-black text-white flex items-center gap-2 mb-2">
              Best Options on Route
            </h2>
            <div className="space-y-4">
              {results.map((station, index) => (
                <div key={station.id} className="space-y-4">
                  <div className="flex flex-col">
                    <div 
                      className={`relative bg-slate-900 p-5 border transition-all ${fuelType === 'diesel' ? 'hover:border-sky-500/50' : 'hover:border-emerald-500/50'} ${index === 0 ? (fuelType === 'diesel' ? 'rounded-t-2xl border-sky-500/30 shadow-lg shadow-sky-500/10' : 'rounded-t-2xl border-emerald-500/30 shadow-lg shadow-emerald-500/10') : 'rounded-2xl border-slate-800'}`}
                    >
                      {index === 0 && (
                        <div className={`absolute -top-3 right-4 text-slate-950 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-sm ${fuelType === "diesel" ? "bg-sky-500" : "bg-emerald-500"}`}>
                          Cheapest
                        </div>
                      )}
                      
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm grayscale-[0.2]">{station.countryCode === 'FR' ? '🇫🇷' : '🇬🇧'}</span>
                            <h3 className="font-bold text-lg text-white">{station.brand}</h3>
                            {station.isMotorway && (                              <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-amber-500/30">
                                Motorway
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-400 mt-0.5">{station.address}</p>
                          <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                            <Navigation className="w-3 h-3" /> {station.distance}
                          </p>
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
                          <div className="text-[10px] text-slate-500/80 font-medium mt-1 pr-1">
                            Price changed: {station.lastUpdated}
                          </div>
                        </div>                      </div>

                      <button 
                        onClick={() => setSelectedStation(station)}
                        className="w-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700"
                      >
                        <Navigation className={`w-4 h-4 ${fuelType === 'diesel' ? 'text-sky-400' : 'text-emerald-400'}`} /> Navigate Here
                      </button>
                    </div>
                    
                    {index === 0 && stats && (
                      <div className={`bg-gradient-to-br border-l border-r border-b rounded-b-2xl p-4 flex flex-col gap-3 ${fuelType === "diesel" ? "from-sky-500/10 to-blue-500/5 border-sky-500/20" : "from-emerald-500/10 to-teal-500/5 border-emerald-500/20"}`}>
                        <div className="flex justify-between items-center text-sm">
                          <span className={`font-medium ${fuelType === "diesel" ? "text-sky-300/80" : "text-emerald-300/80"}`}>vs. Most Expensive:</span>
                          <span className={`${fuelType === 'diesel' ? 'text-sky-400' : 'text-emerald-400'} font-bold`}>{(stats.maxPrice - station.price).toFixed(1)}{station.countryCode === 'GB' ? 'p' : 'c'} / L cheaper</span>
                        </div>
                        <div className="flex justify-between items-center text-sm">
                          <span className={`font-medium ${fuelType === "diesel" ? "text-sky-300/80" : "text-emerald-300/80"}`}>vs. Route Average:</span>
                          <span className={`${fuelType === 'diesel' ? 'text-sky-400' : 'text-emerald-400'} font-bold`}>{(stats.avgPrice - station.price).toFixed(1)}{station.countryCode === 'GB' ? 'p' : 'c'} / L cheaper</span>
                        </div>
                        <div className={`pt-3 border-t mt-1 flex justify-between items-end ${fuelType === "diesel" ? "border-sky-500/10" : "border-emerald-500/10"}`}>
                          <div className="text-xs text-slate-400 max-w-[60%]">
                            Estimated savings on a full 60L tank vs maximum price
                          </div>
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
            </div>
          </section>
        )}
      </main>

      <Footer />

      <NavigationBottomSheet 
        isOpen={!!selectedStation} 
        onClose={() => setSelectedStation(null)} 
        station={selectedStation}
        startPostcode={cityData.postcode}
        endPostcode={endPostcode}
      />
    </div>
  );
}
