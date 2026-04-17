import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { localData } from '../content/localData';
import { Footer } from '../components/Footer';
import { ArrowRight, Map } from 'lucide-react';

export default function LocationsIndex() {
  const cities = Object.keys(localData).map(slug => ({
    slug,
    name: (localData as any)[slug].h1.replace('Cheapest Fuel in ', '')
  })).sort((a, b) => a.name.localeCompare(b.name));

  const metaDescription = "Browse our complete directory of UK cities to find the cheapest live petrol and diesel prices near you.";
  const canonicalUrl = "https://pumpprice.live/locations";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500/30 pb-20">
      <Helmet>
        <title>UK City Directory | Pumpprice</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="UK City Directory | Pumpprice" />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="twitter:title" content="UK City Directory | Pumpprice" />
        <meta property="twitter:description" content={metaDescription} />
      </Helmet>
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sticky top-0 z-[100] shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between relative px-6">
          <Link 
            to="/"
            className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
          </Link>
          <h1 className="text-2xl font-black font-display tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-100 to-emerald-500 uppercase">
            UK Cities
          </h1>
          <div className="w-10 h-10"></div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
            <Map className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">City Directory</h2>
            <p className="text-sm text-slate-400">Live prices across major UK urban centers.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {cities.map(city => (
            <Link 
              key={city.slug} 
              to={`/city/${city.slug}`}
              className="bg-slate-900 border border-slate-800 p-4 rounded-2xl hover:bg-slate-800 hover:border-emerald-500/50 transition-all font-bold text-white flex items-center justify-between group shadow-sm"
            >
              <span>{city.name}</span>
              <span className="text-emerald-500 group-hover:translate-x-1 transition-transform">&rarr;</span>
            </Link>
          ))}
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
