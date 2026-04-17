import React, { useState, useEffect } from 'react';
import { Info, Fuel } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { fetchPremiumGap, type PremiumGapStat } from '../services/stations';

export const PremiumGapInsight: React.FC = () => {
  const [premiumGapData, setPremiumGapData] = useState<PremiumGapStat[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fuelType, setFuelType] = useState<'petrol' | 'diesel'>('petrol');

  useEffect(() => {
    setIsLoading(true);
    fetchPremiumGap(fuelType).then(data => {
      setPremiumGapData(data);
      setIsLoading(false);
    });
  }, [fuelType]);

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden mt-6 mb-8">
      <div className="p-5 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Fuel className="w-5 h-5 text-rose-400" />
            <h3 className="text-lg font-bold text-white">Premium vs Regular</h3>
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
          Which brands have the highest markup for premium fuel? High price differences extract maximum margin from premium buyers.
        </p>
      </div>

      <div className="p-4 sm:p-5">
        <div className="w-full transition-all duration-300" style={{ height: Math.max(350, premiumGapData.length * 55) }}>
          <ResponsiveContainer width="100%" height="100%">
            {isLoading ? (
              <div className="flex h-full items-center justify-center text-slate-400 animate-pulse font-medium">Analyzing premium prices...</div>
            ) : premiumGapData.length > 0 ? (
              <BarChart 
                layout="vertical" 
                data={premiumGapData} 
                margin={{ top: 10, right: 50, left: -10, bottom: 0 }} 
                barGap={3}
                barCategoryGap="30%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={true} vertical={false} />
                <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} domain={['dataMin - 5', 'dataMax + 12']} />
                <YAxis 
                  type="category" 
                  dataKey="brand" 
                  stroke="#94a3b8" 
                  fontSize={11} 
                  fontWeight="bold"
                  tickLine={false} 
                  axisLine={false} 
                  width={100} 
                />
                <Tooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.03)' }} 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  itemStyle={{ color: '#f8fafc', fontSize: '14px', fontWeight: 'bold' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', color: '#94a3b8', paddingTop: '15px' }} />
                <Bar dataKey="standard" name="Regular" fill={fuelType === "diesel" ? "#0ea5e9" : "#10b981"} radius={[0, 4, 4, 0]} barSize={18} />
                <Bar dataKey="premium" name="Premium" fill="#fb7185" radius={[0, 4, 4, 0]} barSize={18}>
                  <LabelList 
                    dataKey="gap" 
                    position="right" 
                    fill="#f1f5f9" 
                    fontSize={12} 
                    fontWeight="900"
                    formatter={(val: any) => typeof val === 'number' ? `+${val.toFixed(1)}p` : val} 
                  />
                </Bar>
              </BarChart>
            ) : (
              <div className="flex h-full items-center justify-center text-slate-400">No premium data available</div>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      <div className="p-5 border-t border-slate-800 bg-slate-800/20 text-sm text-slate-400 leading-relaxed">
        <h4 className="font-semibold text-slate-300 mb-2">The Premium Tax</h4>
        <p>
          While supermarket regular fuels typically maintain a consistent difference under 10p per litre, major brands can charge significantly more. Our tracking shows which retailers are currently providing the best value for high-performance fuels, helping you avoid unnecessary markups.
        </p>
      </div>
    </div>
  );
};
