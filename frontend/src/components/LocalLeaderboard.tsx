import { Navigation, MapPin } from 'lucide-react';

interface Station {
  id?: string;
  brand: string;
  address: string;
  postcode?: string;
  price: number;
  lat?: number;
  lng?: number;
  distance?: number; // distance in meters if available, but city stats just has stations near the point.
  countryCode?: string;
}

interface LocalLeaderboardProps {
  stations: Station[];
  fuelType: 'petrol' | 'diesel';
  cityName: string;
}

export const LocalLeaderboard = ({ stations, fuelType, cityName }: LocalLeaderboardProps) => {
  // Filter out invalid prices, sort by price, and take top 10
  const topStations = [...stations]
    .filter(s => s.price && s.price > 0)
    .sort((a, b) => a.price - b.price)
    .slice(0, 10);

  if (topStations.length === 0) return null;

  return (
    <div className="bg-slate-900/80 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden mt-8">
      <div className="p-6 border-b border-slate-800">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          Top 10 Cheapest in {cityName}
        </h3>
        <p className="text-sm text-slate-400 mt-1">Live {fuelType === 'petrol' ? 'petrol' : 'diesel'} prices from forecourts nearby.</p>
      </div>
      
      <div className="divide-y divide-slate-800/50">
        {topStations.map((station, index) => {
          const mapUrl = station.lat && station.lng 
            ? `https://www.google.com/maps/dir/?api=1&destination=${station.lat},${station.lng}`
            : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(station.brand + ' ' + station.address)}`;

          return (
            <div key={index} className="p-5 hover:bg-slate-800/30 transition-colors flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shrink-0 shadow-inner ${index === 0 ? (fuelType === 'diesel' ? 'bg-sky-500 text-slate-950' : 'bg-emerald-500 text-slate-950') : 'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-white leading-tight">{station.brand}</h4>
                    <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">
                      {[station.address, station.postcode].filter(Boolean).join(' ')}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <div className="flex items-baseline gap-0.5 justify-end">
                    {station.countryCode === 'FR' ? (
                      <>
                        <span className="text-sm font-bold text-slate-500 mr-1">€</span>
                        <span className={`text-2xl font-black tracking-tighter ${index === 0 ? (fuelType === 'diesel' ? 'text-sky-400' : 'text-emerald-400') : 'text-slate-200'}`}>
                          {(station.price / 100).toFixed(2)}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className={`text-2xl font-black tracking-tighter ${index === 0 ? (fuelType === 'diesel' ? 'text-sky-400' : 'text-emerald-400') : 'text-slate-200'}`}>
                          {Math.floor(station.price)}.9
                        </span>
                        <span className="text-xs font-semibold text-slate-500">p</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <a 
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => {
                  if (typeof window !== "undefined" && (window as any).posthog) {
                    (window as any).posthog.capture("get_directions_clicked", { city: cityName, brand: station.brand });
                  }
                }}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors border border-slate-700"
              >
                <MapPin className={`w-4 h-4 ${fuelType === 'diesel' ? 'text-sky-400' : 'text-emerald-400'}`} />
                Get Directions
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
};
