import { Link } from 'react-router-dom';
import { localData } from '../content/localData';

export function PopularCities() {
  const topCities = [
    'cheapest-fuel-in-london',
    'cheapest-fuel-in-birmingham',
    'cheapest-fuel-in-manchester',
    'cheapest-fuel-in-glasgow',
    'cheapest-fuel-in-liverpool',
    'cheapest-fuel-in-leeds',
    'cheapest-fuel-in-sheffield',
    'cheapest-fuel-in-bristol'
  ];

  return (
    <section className="max-w-md mx-auto px-6 py-6 border-t border-slate-800/50">
      <h2 className="text-lg font-black text-white flex items-center gap-2 mb-4">
        Live Fuel Prices by City
      </h2>
      <div className="flex flex-wrap gap-2">
        {topCities.map(slug => {
          const city = (localData as any)[slug];
          if (!city) return null;
          const cityName = city.h1.replace('Cheapest Fuel in ', '');
          return (
            <Link 
              key={slug} 
              to={`/city/${slug}`}
              className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-xs font-bold text-slate-300 hover:text-white hover:border-emerald-500/50 hover:bg-slate-800 transition-all shadow-sm"
            >
              {cityName}
            </Link>
          );
        })}
        <Link 
          to="/locations"
          className="bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-full text-xs font-bold text-emerald-400 hover:text-emerald-300 hover:border-emerald-500/50 transition-all shadow-sm flex items-center gap-1"
        >
          View all 96 cities &rarr;
        </Link>
      </div>
    </section>
  );
}