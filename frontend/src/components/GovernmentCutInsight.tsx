import { useState, useEffect } from 'react';
import { Landmark, Info } from 'lucide-react';
import { fetchUKPriceHistory } from '../services/uk_averages';
import type { UKAverageRecord } from '../services/uk_averages';

export function GovernmentCutInsight() {
  const [fuelType, setFuelType] = useState<'petrol' | 'diesel'>('petrol');
  const [latestData, setLatestData] = useState<UKAverageRecord | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      const data = await fetchUKPriceHistory();
      if (data && data.length > 0) {
        setLatestData(data[data.length - 1]);
      }
      setLoading(false);
    }
    load();
  }, []);

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden mt-6 mb-8">
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white leading-tight">
              The<br />Government Cut
            </h3>
          </div>
          
          <div className="flex bg-slate-800/80 p-1 rounded-lg border border-slate-700/50">
            <button
              onClick={() => setFuelType('petrol')}
              className={`px-3 py-1 text-sm font-semibold rounded-md transition-all ${
                fuelType === 'petrol' 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-sm' 
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              Petrol
            </button>
            <button
              onClick={() => setFuelType('diesel')}
              className={`px-3 py-1 text-sm font-semibold rounded-md transition-all ${
                fuelType === 'diesel' 
                  ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30 shadow-sm' 
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`}
            >
              Diesel
            </button>
          </div>
        </div>
        <p className="text-sm text-slate-400">
          A daily snapshot illustrating exactly how much of a 60L fill-up goes to taxes vs. the retailer.
        </p>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="animate-pulse flex items-center justify-center py-10">
            <div className="text-slate-500 font-medium text-sm">Loading data...</div>
          </div>
        ) : !latestData ? (
          <div className="text-center py-6">
            <Info className="w-8 h-8 text-slate-500 mx-auto mb-2" />
            <p className="text-slate-400 text-sm">Not enough data to calculate breakdown.</p>
          </div>
        ) : (
          (() => {
            const rawAvgPrice = fuelType === 'petrol' ? latestData.petrol_avg : latestData.diesel_avg;
            const avgPricePence = Math.floor(rawAvgPrice) + 0.9;
            const totalCost = (avgPricePence * 60) / 100;
            const duty = 31.77;
            const vat = totalCost / 6;
            const rest = totalCost - duty - vat;
            
            const dutyPct = (duty / totalCost) * 100;
            const vatPct = (vat / totalCost) * 100;
            const restPct = (rest / totalCost) * 100;
            const govCutPct = dutyPct + vatPct;

            const fuelColor = fuelType === 'petrol' ? 'bg-emerald-500' : 'bg-sky-500';
            const fuelTextColor = fuelType === 'petrol' ? 'text-emerald-400' : 'text-sky-400';
            const fuelName = fuelType === 'petrol' ? 'Petrol (E10)' : 'Diesel (B7)';

            return (
              <div className="bg-[#0b101e] rounded-xl p-5 border border-slate-800/50 shadow-inner relative overflow-hidden">
                <div className="absolute -top-10 -right-10 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

                <div className="flex justify-between items-end mb-4 relative z-10">
                  <div>
                    <h3 className="text-sm font-black text-white tracking-tight uppercase">Tax Breakdown</h3>
                    <p className="text-[10px] text-slate-400 font-medium mt-1">
                      Based on a 60L fill-up of <span className={`font-bold ${fuelTextColor}`}>{fuelName}</span> at <span className="text-white font-bold">{avgPricePence.toFixed(1)}p</span>
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">Total Cost</span>
                    <span className="text-xl font-black text-white tracking-tighter">£{totalCost.toFixed(2)}</span>
                  </div>
                </div>

                <div className="h-5 w-full flex rounded-full overflow-hidden shadow-inner mb-5 ring-1 ring-slate-800/50 relative z-10">
                  <div 
                    style={{ width: `${dutyPct}%` }} 
                    className="h-full bg-rose-500 transition-all duration-1000 ease-out" 
                    title={`Fuel Duty: £${duty.toFixed(2)}`}
                  />
                  <div 
                    style={{ width: `${vatPct}%` }} 
                    className="h-full bg-orange-500 transition-all duration-1000 ease-out border-l border-slate-900/50" 
                    title={`VAT: £${vat.toFixed(2)}`}
                  />
                  <div 
                    style={{ width: `${restPct}%` }} 
                    className={`h-full ${fuelColor} transition-all duration-1000 ease-out border-l border-slate-900/50`} 
                    title={`Fuel & Margin: £${rest.toFixed(2)}`}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2 text-center mb-5 relative z-10">
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Duty</span>
                    </div>
                    <div className="text-xs font-black text-white tracking-tight">£{duty.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <div className="w-1.5 h-1.5 rounded-full bg-orange-500"></div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">VAT</span>
                    </div>
                    <div className="text-xs font-black text-white tracking-tight">£{vat.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 mb-0.5">
                      <div className={`w-1.5 h-1.5 rounded-full ${fuelColor}`}></div>
                      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">Fuel</span>
                    </div>
                    <div className="text-xs font-black text-white tracking-tight">£{rest.toFixed(2)}</div>
                  </div>
                </div>

                <div className="bg-slate-900/50 rounded-lg p-2.5 border border-slate-800 text-center relative z-10">
                  <p className="text-[11px] font-medium text-slate-300">
                    Today, the Government is taking <span className="text-rose-400 font-bold">{govCutPct.toFixed(1)}%</span> of your fill-up.
                  </p>
                </div>
              </div>
            );
          })()
        )}
      </div>

      <div className="p-5 border-t border-slate-800 bg-slate-800/20 text-sm text-slate-400 leading-relaxed">
        <h4 className="font-semibold text-slate-300 mb-2">Why does the government take more when prices rise?</h4>
        <p>
          While Fuel Duty is a fixed rate (currently 52.95p per litre), VAT is charged at 20% on the <strong>total</strong> price of your fuel—including the duty itself! This means that whenever wholesale fuel prices or retailer margins increase, the government's VAT take automatically increases alongside it.
        </p>
      </div>
    </div>
  );
}