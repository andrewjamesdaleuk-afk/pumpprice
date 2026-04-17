import { useState, useEffect } from 'react';
import { fetchPriceProjection, type ProjectionResponse } from '../services/projection';

export function PriceProjectionCard() {
  const [data, setData] = useState<ProjectionResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setIsLoading(true);
      const result = await fetchPriceProjection();
      setData(result);
      setIsLoading(false);
    }
    load();
  }, []);

  if (isLoading || !data || data.data.length === 0) {
    return (
      <div className="w-full max-w-md mx-auto px-6 mb-4">
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-4 shadow-lg flex items-center justify-center min-h-[100px]">
          <div className="text-slate-500 font-medium animate-pulse text-sm">Analyzing market futures...</div>
        </div>
      </div>
    );
  }

  // Calculate sentiment dynamically based on the most recent vs previous wholesale prices
  let sentiment: 'up' | 'down' | 'stable' = 'stable';
  if (data && data.data.length >= 7) {
    const sortedData = [...data.data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const latest = sortedData[sortedData.length - 1];
    const previous = sortedData[sortedData.length - 7]; // Look back roughly 1 week
    
    if (latest.wholesale_p && previous.wholesale_p) {
      const diff = latest.wholesale_p - previous.wholesale_p;
      if (diff > 1.5) sentiment = 'up';
      else if (diff < -1.5) sentiment = 'down';
    }
  }

  // Styling configuration based on sentiment
  const config = {
    up: {
      bg: 'from-emerald-950/80 to-slate-900 border-emerald-500/40 shadow-emerald-500/10',
      iconColor: 'text-emerald-400',
      text: <>Oil Futures prices are going up.<br/><span className="font-bold">Buy now as prices are only going to go up.</span></>,
      lightTop: 'bg-slate-800',
      lightMiddle: 'bg-slate-800',
      lightBottom: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,1)]',
      arrow: (
        <svg className="absolute -right-6 -bottom-6 w-36 h-36 opacity-10 text-emerald-400 -rotate-12 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    down: {
      bg: 'from-red-950/80 to-slate-900 border-red-500/40 shadow-red-500/10',
      iconColor: 'text-red-400',
      text: <>Oil Futures prices are coming down.<br/><span className="font-bold">Buying in the future will be cheaper (if you can wait).</span></>,
      lightTop: 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,1)]',
      lightMiddle: 'bg-slate-800',
      lightBottom: 'bg-slate-800',
      arrow: (
        <svg className="absolute -right-6 -bottom-6 w-36 h-36 opacity-10 text-red-400 -rotate-12 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
        </svg>
      )
    },
    stable: {
      bg: 'from-amber-950/80 to-slate-900 border-amber-500/40 shadow-amber-500/10',
      iconColor: 'text-amber-400',
      text: <>Oil Futures prices are in line with now.<br/><span className="font-bold">Might as well buy now.</span></>,
      lightTop: 'bg-slate-800',
      lightMiddle: 'bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,1)]',
      lightBottom: 'bg-slate-800',
      arrow: (
        <svg className="absolute -right-6 -bottom-6 w-36 h-36 opacity-10 text-amber-400 -rotate-12 pointer-events-none" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
        </svg>
      )
    }
  };

  const conf = config[sentiment];

  return (
    <div className="w-full max-w-md mx-auto px-6 mb-4">
      <div className={`relative overflow-hidden rounded-2xl py-3 px-5 border bg-gradient-to-br shadow-xl transition-all duration-500 ${conf.bg}`}>
        
        {/* Background Arrow Watermark */}
        {conf.arrow}

        <div className="relative z-10 flex items-center gap-4">
          {/* Vertical Traffic Light */}
          <div className="flex flex-col bg-slate-950/80 border border-slate-800/80 rounded-full p-1.5 gap-1.5 shadow-inner shrink-0">
            <div className={`w-3 h-3 rounded-full transition-all duration-500 ${conf.lightTop}`} />
            <div className={`w-3 h-3 rounded-full transition-all duration-500 ${conf.lightMiddle}`} />
            <div className={`w-3 h-3 rounded-full transition-all duration-500 ${conf.lightBottom}`} />
          </div>

          {/* Text Content */}
          <div>
            <h2 className={`text-[10px] font-black uppercase tracking-widest mb-0.5 ${conf.iconColor}`}>
              Price Forecast
            </h2>
            <p className="text-sm text-slate-200 leading-snug font-medium pr-2">
              {conf.text}
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}