import { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { fetchUKPriceHistory } from '../services/uk_averages';
import type { UKAverageRecord } from '../services/uk_averages';

export function UKPriceTrend() {
  const [history, setHistory] = useState<UKAverageRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const data = await fetchUKPriceHistory();
      setHistory(data);
      setIsLoading(false);
    }
    load();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full max-w-md mx-auto px-6 mt-0 mb-4">
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-lg shadow-black/20 flex items-center justify-center min-h-[300px]">
          <div className="text-slate-500 font-medium animate-pulse text-sm">Loading national averages...</div>
        </div>
      </div>
    );
  }

  // If no data yet, gracefully hide or show empty state
  if (!history || history.length === 0) {
    return null; 
  }

  // The latest day's data for the cards
  const latest = history[history.length - 1];

  // Format data for Recharts
  const chartData = history.map(row => {
    const d = new Date(row.date);
    const dateStr = d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }); // "Mar 15"
    return {
      date: dateStr,
      petrol: row.petrol_avg,
      diesel: row.diesel_avg
    };
  });

  return (
    <div className="w-full max-w-md mx-auto px-6 mt-0 mb-4">
      <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-5 shadow-lg shadow-black/20">
        
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h2 className="text-base font-bold text-white tracking-tight truncate">Live UK Averages - {new Date(latest.date).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}</h2>
        </div>

        {/* The Two Averages Cards */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-[#0b101e] rounded-xl p-4 border border-slate-800/80">
            <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Petrol (E10)</div>
            <div className="text-2xl min-[380px]:text-3xl font-black text-emerald-400 tracking-tighter mb-4 flex flex-wrap items-baseline gap-x-1">
              {Math.floor(Number(latest.petrol_avg))}.9<span className="text-sm font-semibold text-slate-500">p</span> <span className="text-sm font-medium text-slate-500 ml-1">Avg</span>
            </div>
            <div className="flex justify-between border-t border-slate-800/50 pt-3">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Low</span>
                <span className="text-sm font-bold text-white tracking-tight">{(latest.petrol_low && Number(latest.petrol_low) > 0) ? `${Number(latest.petrol_low).toFixed(1)}p` : '---'}</span>
                {latest.petrol_low_brand && <span className="text-[9px] text-emerald-400 mt-0.5 truncate max-w-[60px]">{latest.petrol_low_brand}</span>}
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-slate-500 font-bold uppercase">High</span>
                <span className="text-sm font-bold text-white tracking-tight">{(latest.petrol_high && Number(latest.petrol_high) > 0) ? `${Number(latest.petrol_high).toFixed(1)}p` : '---'}</span>
                {latest.petrol_high_brand && <span className="text-[9px] text-red-400 mt-0.5 truncate max-w-[60px]">{latest.petrol_high_brand}</span>}
              </div>
            </div>
          </div>

          <div className="bg-[#0b101e] rounded-xl p-4 border border-slate-800/80">
            <div className="text-xs font-bold text-slate-500 mb-1 uppercase tracking-wider">Diesel (B7)</div>
            <div className="text-2xl min-[380px]:text-3xl font-black text-sky-400 tracking-tighter mb-4 flex flex-wrap items-baseline gap-x-1">
              {Math.floor(Number(latest.diesel_avg))}.9<span className="text-sm font-semibold text-slate-500">p</span> <span className="text-sm font-medium text-slate-500 ml-1">Avg</span>
            </div>
            <div className="flex justify-between border-t border-slate-800/50 pt-3">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-500 font-bold uppercase">Low</span>
                <span className="text-sm font-bold text-white tracking-tight">{(latest.diesel_low && Number(latest.diesel_low) > 0) ? `${Number(latest.diesel_low).toFixed(1)}p` : '---'}</span>
                {latest.diesel_low_brand && <span className="text-[9px] text-sky-400 mt-0.5 truncate max-w-[60px]">{latest.diesel_low_brand}</span>}
              </div>
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-slate-500 font-bold uppercase">High</span>
                <span className="text-sm font-bold text-white tracking-tight">{(latest.diesel_high && Number(latest.diesel_high) > 0) ? `${Number(latest.diesel_high).toFixed(1)}p` : '---'}</span>
                {latest.diesel_high_brand && <span className="text-[9px] text-red-400 mt-0.5 truncate max-w-[60px]">{latest.diesel_high_brand}</span>}
              </div>
            </div>
          </div>
        </div>

        {/* The 7-Day Trend Graph */}
        <div className="pt-2">
          <div className="text-xs font-bold text-slate-500 mb-4 uppercase tracking-wider pl-1">7-Day UK Price Trend</div>
          
          <div className="w-full h-[240px] bg-[#0b101e] rounded-xl border border-slate-800/80 pt-4 pr-4 pb-2 text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  tick={{fill: '#64748b', fontSize: 9}}
                  axisLine={false}
                  tickLine={false}
                  dy={5}
                  interval={0}
                  tickMargin={8}
                />
                <YAxis 
                  domain={['dataMin - 2', 'dataMax + 2']} 
                  stroke="#64748b"
                  tick={{fill: '#64748b', fontSize: 10}}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => `${Math.floor(val)}.9p`}
                />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px', color: '#f8fafc', fontSize: '12px', fontWeight: 'bold' }}
                  itemStyle={{ fontSize: '12px' }}
                  labelStyle={{ color: '#94a3b8', marginBottom: '4px' }}
                />
                <Line 
                  type="monotone" 
                  name="Petrol"
                  dataKey="petrol" 
                  stroke="#34d399" 
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#0f172a', stroke: '#34d399', strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: '#34d399', stroke: '#0f172a' }}
                />
                <Line 
                  type="monotone" 
                  name="Diesel"
                  dataKey="diesel" 
                  stroke="#38bdf8" 
                  strokeWidth={2}
                  dot={{ r: 3, fill: '#0f172a', stroke: '#38bdf8', strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: '#38bdf8', stroke: '#0f172a' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-500 text-center mt-4">
            National average calculated daily across {latest.sample_size.toLocaleString()}+ CMA registered fuel stations.
          </p>
        </div>

      </div>
    </div>
  );
}
