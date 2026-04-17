import { Link } from 'react-router-dom';
import { Footer } from '../components/Footer';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, ShieldCheck } from 'lucide-react';

export default function Privacy() {
  const metaDescription = "Read the Privacy Policy for Pumpprice.live. Learn how we handle your data, location tracking, and analytics.";
  const canonicalUrl = "https://pumpprice.live/privacy";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500/30 pb-20">
      <Helmet>
        <title>Privacy Policy | Pumpprice</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="Privacy Policy | Pumpprice" />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="twitter:title" content="Privacy Policy | Pumpprice" />
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
            Privacy Policy
          </h1>
          <div className="w-10 h-10"></div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Privacy Hub</h2>
            <p className="text-sm text-slate-400">How we handle and protect your data.</p>
          </div>
        </div>

        <div className="prose prose-invert prose-emerald max-w-none text-slate-300 leading-relaxed space-y-6 prose-headings:font-bold prose-headings:text-white prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-white">
          <p className="text-xs text-slate-500 mb-4">Last updated: March 2026</p>
          
          <h3 className="text-lg font-bold text-white mb-2">1. Information We Collect</h3>
          <p className="text-sm">Pumpprice.live is designed to be privacy-first. We do not require account registration, and we do not collect personally identifiable information (PII) such as your name, email address, or phone number.</p>
          
          <h3 className="text-lg font-bold text-white mb-2">2. Analytics and Tracking</h3>
          <p className="text-sm">We use privacy-friendly analytics tools (PostHog) to understand how our website is used. This helps us improve the user experience. We track anonymous usage data such as page views, routes searched, and button clicks. This data is anonymized and cannot be used to identify you personally.</p>
          
          <h3 className="text-lg font-bold text-white mb-2">3. Location Data</h3>
          <p className="text-sm">When you enter postcodes to search for fuel prices, that data is processed momentarily to calculate the route and find nearby stations. We do not store your journey history or home address.</p>
          
          <h3 className="text-lg font-bold text-white mb-2">4. Third-Party Services</h3>
          <p className="text-sm">We use OpenStreetMap (Nominatim) and OSRM for routing and geocoding. These services may log your IP address temporarily to prevent abuse, in accordance with their own privacy policies.</p>
          
          <h3 className="text-lg font-bold text-white mb-2">5. Contact</h3>
          <p className="text-sm">If you have any questions about this Privacy Policy, please contact us.</p>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}
