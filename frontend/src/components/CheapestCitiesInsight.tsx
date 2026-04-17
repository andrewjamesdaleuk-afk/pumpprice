import { useState, useEffect } from 'react';
import { TrendingDown, Info } from 'lucide-react';
import { fetchRankedCities, fetchCityStats } from '../services/stations';
import type { RankedCityStat } from '../services/stations';

interface CityFullStat extends RankedCityStat {
  petrolStats: { avg: string, min: string, max: string, count: number } | null;
  dieselStats: { avg: string, min: string, max: string, count: number } | null;
}

export function CheapestCitiesInsight() {
  const [fuelType, setFuelType] = useState<'E10' | 'B7'>('E10');
  const [data, setData] = useState<CityFullStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      // Fetch ranking based on selected fuelType
      const rankedCities = await fetchRankedCities('cheapest', fuelType);
      
      // Data already contains petrolStats and dieselStats from the precomputed table
      setData(rankedCities as any);
      setLoading(false);
    }
    load();
  }, [fuelType]);

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden mt-6 mb-8">
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Cheapest Cities</h3>
          </div>
          
          <div className="flex bg-slate-800/80 p-1 rounded-lg border border-slate-700/50">
            <button
              onClick={() => setFuelType('E10')}
              className={`px-3 py-1 text-sm font-semibold rounded-md transition-all ${
                fuelType === 'E10' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm' 
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              Petrol
            </button>
            <button
              onClick={() => setFuelType('B7')}
              className={`px-3 py-1 text-sm font-semibold rounded-md transition-all ${
                fuelType === 'B7' 
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-sm' 
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              Diesel
            </button>
          </div>
        </div>
        <p className="text-sm text-slate-400">
          The 3 cheapest UK cities for fuel. Ranking is based on the selected fuel's average price.
        </p>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col gap-2">
                <div className="w-1/3 h-5 bg-slate-800 rounded" />
                <div className="w-full h-16 bg-slate-800 rounded-xl" />
              </div>
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="text-center py-6">
            <Info className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Not enough data available.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.slice(0, 3).map((city, index) => (
              <div 
                key={city.city}
                className="p-4 rounded-xl border bg-slate-800/50 border-slate-700/50"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs bg-emerald-500/20 text-emerald-400">
                    #{index + 1}
                  </div>
                  <span className="font-bold text-lg text-white block">{city.city}</span>
                </div>
                
                <div className="mt-2">
                  <div className="bg-[#0b101e] rounded-xl p-4 border border-slate-800/80">
                    <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wider">
                      {fuelType === 'E10' ? 'Petrol Average' : 'Diesel Average'}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className={`text-3xl font-black tracking-tighter flex items-baseline ${fuelType === 'E10' ? 'text-emerald-400' : 'text-sky-400'}`}>
                        {Math.floor(Number(city.price))}<span>.9</span>p
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 font-bold uppercase block mb-0.5">Vs National Avg</span>
                        <div className={`text-sm font-bold tracking-tight px-2 py-0.5 rounded-md inline-block ${Number(city.diff) < 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                          {Number(city.diff) > 0 ? '+' : ''}{Number(city.diff).toFixed(1)}p
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-5 border-t border-slate-800 bg-slate-800/20 text-sm text-slate-400 leading-relaxed">
        <h4 className="font-semibold text-slate-300 mb-2">Where is the cheapest fuel in the UK?</h4>
        <p>
          These top 3 cheapest UK cities consistently offer the lowest petrol and diesel prices, often driven by fierce competition among major supermarket brands like Asda, Tesco, and Morrisons. Drivers in areas like Belfast and Northern England frequently benefit from localized price drops. Monitoring these affordable regions helps highlight just how much you can save compared to the national average.
        </p>
      </div>
    </div>
  );
}