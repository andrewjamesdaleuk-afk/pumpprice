import { useState, useEffect } from 'react';

interface SavingsCalculatorProps {
  cheapestPrice: number;
  averagePrice: number;
  maxPrice: number;
  fuelType: 'petrol' | 'diesel';
  cityName: string;
}

export const SavingsCalculator = ({ cheapestPrice, maxPrice, fuelType, cityName }: SavingsCalculatorProps) => {
  const [litersPerWeek, setLitersPerWeek] = useState(40);
  const [userPrice, setUserPrice] = useState<number>(maxPrice); // Start at max price default
  
  // Track events in posthog if available
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("savings_calculator_viewed", { city: cityName, fuelType });
    }
  }, [cityName, fuelType]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLitersPerWeek(Number(e.target.value));
    if (typeof window !== "undefined" && (window as any).posthog) {
      (window as any).posthog.capture("savings_calculator_used", { liters: e.target.value, city: cityName });
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserPrice(Number(e.target.value));
  };

  // Monthly is roughly 4.33 weeks
  const litersPerMonth = litersPerWeek * 4.33;
  const currentCost = (litersPerMonth * userPrice) / 100; // in pounds
  const cheapestCost = (litersPerMonth * cheapestPrice) / 100; // in pounds
  const savings = currentCost - cheapestCost;

  return (
    <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-6 rounded-3xl border border-slate-800 shadow-2xl relative overflow-hidden">
      <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 pointer-events-none ${fuelType === 'diesel' ? 'bg-sky-500' : 'bg-emerald-500'}`}></div>
      
      <h3 className="text-xl font-black text-white mb-2 relative z-10">Monthly Savings Calculator</h3>
      <p className="text-sm text-slate-400 mb-6 relative z-10">See how much you could save per month in {cityName} by switching to the cheapest {fuelType === 'petrol' ? 'petrol' : 'diesel'}.</p>

      <div className="space-y-6 relative z-10">
        <div>
          <div className="flex justify-between text-sm mb-2 font-medium">
            <span className="text-slate-300">Your Current Price (p/L)</span>
            <span className={fuelType === 'diesel' ? 'text-sky-400 font-bold' : 'text-emerald-400 font-bold'}>{userPrice.toFixed(1)}p</span>
          </div>
          <input 
            type="range" 
            min={cheapestPrice} 
            max={maxPrice + 10} 
            step="0.1" 
            value={userPrice}
            onChange={handlePriceChange}
            className={`w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 ${fuelType === 'diesel' ? 'focus:ring-sky-500/50 [&::-webkit-slider-thumb]:bg-sky-500' : 'focus:ring-emerald-500/50 [&::-webkit-slider-thumb]:bg-emerald-500'} [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full`}
          />
        </div>

        <div>
          <div className="flex justify-between text-sm mb-2 font-medium">
            <span className="text-slate-300">Fuel Used Per Week</span>
            <span className={fuelType === 'diesel' ? 'text-sky-400 font-bold' : 'text-emerald-400 font-bold'}>{litersPerWeek} Liters</span>
          </div>
          <input 
            type="range" 
            min="10" 
            max="100" 
            step="5" 
            value={litersPerWeek}
            onChange={handleSliderChange}
            className={`w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 ${fuelType === 'diesel' ? 'focus:ring-sky-500/50 [&::-webkit-slider-thumb]:bg-sky-500' : 'focus:ring-emerald-500/50 [&::-webkit-slider-thumb]:bg-emerald-500'} [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:rounded-full`}
          />
        </div>

        <div className={`mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between`}>
          <div>
            <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Your Potential Savings</div>
            <div className="text-slate-500 text-sm">vs paying {userPrice.toFixed(1)}p</div>
          </div>
          <div className={`text-3xl font-black tracking-tighter ${savings > 0 ? (fuelType === 'diesel' ? 'text-sky-400' : 'text-emerald-400') : 'text-slate-500'}`}>
            £{Math.max(0, savings).toFixed(2)}
          </div>
        </div>
      </div>
    </div>
  );
};
