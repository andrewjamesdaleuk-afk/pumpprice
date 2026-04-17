import { useState, useEffect } from 'react';
import { Trophy, Info } from 'lucide-react';
import { fetchBrandLeaderboard } from '../services/stations';
import type { BrandStat } from '../services/stations';

export function BrandLeaderboard() {
  const [fuelType, setFuelType] = useState<'E10' | 'B7'>('E10');
  const [leaderboard, setLeaderboard] = useState<BrandStat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchBrandLeaderboard(fuelType);
      setLeaderboard(data);
      setLoading(false);
    }
    load();
  }, [fuelType]);

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden mt-6 mb-8">
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Brand Leaderboard</h3>
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
          Ranked by average price across all UK stations based on the latest data.
        </p>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-slate-800" />
                  <div className="w-24 h-4 bg-slate-800 rounded" />
                </div>
                <div className="w-16 h-4 bg-slate-800 rounded" />
              </div>
            ))}
          </div>
        ) : leaderboard.length === 0 ? (
          <div className="text-center py-6">
            <Info className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Not enough data to calculate leaderboard.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {leaderboard.map((brand, index) => (
              <div 
                key={brand.brand}
                className={`flex items-center justify-between p-3 rounded-xl border ${
                  index === 0 
                    ? 'bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                    : index === leaderboard.length - 1
                      ? 'bg-red-500/5 border-red-500/10'
                      : 'bg-slate-800/50 border-slate-700/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    index === 0 ? 'bg-emerald-500/20 text-emerald-400' : 
                    index === 1 ? 'bg-slate-300/20 text-slate-300' :
                    index === 2 ? 'bg-amber-600/20 text-amber-500' :
                    'bg-slate-800 text-slate-500'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <span className="font-bold text-white block">{brand.brand}</span>
                    <span className="text-xs text-slate-500">{brand.station_count} stations</span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-2xl font-black tracking-tighter flex items-baseline justify-end ${
                    index === 0 ? 'text-emerald-400' : 
                    index === leaderboard.length - 1 ? 'text-red-400' :
                    'text-white'
                  }`}>
                    {Math.floor(brand.price)}<span>.9</span>p
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="p-5 border-t border-slate-800 bg-slate-800/20 text-sm text-slate-400 leading-relaxed">
        <h4 className="font-semibold text-slate-300 mb-2">Who has the cheapest fuel in the UK?</h4>
        <p>
          Our live petrol and diesel brand leaderboard is updated daily using the latest Competition and Markets Authority (CMA) open data. We analyse thousands of forecourts across the UK to help you identify which major retailers and supermarket petrol stations consistently offer the best value at the pumps. Check back regularly to see if supermarkets like Tesco, Asda, Sainsbury's, and Morrisons are maintaining their price gap against premium brands like Shell, BP, and Esso.
        </p>
      </div>
    </div>
  );
}
