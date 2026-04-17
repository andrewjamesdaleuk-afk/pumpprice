const fs = require('fs');

let file = fs.readFileSync('Pumpprice/frontend/src/pages/LocalCity.tsx', 'utf8');

// 1. Add fetchCityStats import
file = file.replace(
  "import { fetchStationsNearRoute } from '../services/stations';",
  "import { fetchStationsNearRoute, fetchCityStats } from '../services/stations';"
);

// 2. Add state for cityStats
file = file.replace(
  "const [stats, setStats] = useState<{ maxPrice: number, avgPrice: number } | null>(null);",
  "const [stats, setStats] = useState<{ maxPrice: number, avgPrice: number } | null>(null);\n  const [cityStats, setCityStats] = useState<{ petrol: any, diesel: any } | null>(null);"
);

// 3. Fetch cityStats on mount
const effectHook = `
  useEffect(() => {
    if (!cityData) return;
    document.title = cityData.title + ' | Pumpprice';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', cityData.description);
    }
    
    // Fetch background stats for the 5-mile radius (8046.72m)
    fetchCityStats(cityData.postcode, 8046.72).then(res => {
      if (res) setCityStats(res);
    });
  }, [slug]);
`;

file = file.replace(
  /useEffect\(\(\) => {[\s\S]*?}, \[slug\]\);/,
  effectHook
);

// 4. Inject the Stats Module at the top of the main container
const statsModule = `
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-black text-white mb-6 uppercase tracking-tight">{cityData.h1}</h1>
          
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
                    <div className="text-3xl font-black text-emerald-400 mb-1">{cityStats.petrol.avg}p <span className="text-sm text-slate-500 font-medium">Avg</span></div>
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
                    <div className="text-3xl font-black text-emerald-400 mb-1">{cityStats.diesel.avg}p <span className="text-sm text-slate-500 font-medium">Avg</span></div>
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

          <p className="text-slate-400 text-sm font-medium px-2 pb-4">
            Driving out of {cityData.h1.replace('Cheapest Fuel in ', '')}? Enter your destination to see live prices from every petrol station along your planned route.
          </p>
        </div>
`;

file = file.replace(
  /<div className="text-center space-y-2">[\s\S]*?<\/div>/,
  statsModule
);

fs.writeFileSync('Pumpprice/frontend/src/pages/LocalCity.tsx', file);
console.log("Injected Stats Module into LocalCity.tsx");
