import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowRight, Info } from 'lucide-react';
import { Footer } from '../components/Footer';

const About: React.FC = () => {
  const metaDescription = "Learn about Pumpprice's mission to help UK drivers save money on fuel using live open data from the CMA.";
  const canonicalUrl = "https://pumpprice.live/about";

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500/30 pb-20">
      <Helmet>
        <title>About Us | Pumpprice</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content="About Us | Pumpprice" />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="twitter:title" content="About Us | Pumpprice" />
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
            About Pumpprice
          </h1>
          <div className="w-10 h-10"></div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
            <Info className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">About Us</h2>
            <p className="text-sm text-slate-400">Our mission and open data platform.</p>
          </div>
        </div>

        <div className="prose prose-invert prose-emerald max-w-none text-slate-300 leading-relaxed space-y-6 prose-headings:font-bold prose-headings:text-white prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline prose-strong:text-white">
          <p className="text-lg font-medium text-white">
            Our mission is simple: to help UK drivers save money on fuel by providing transparent, up-to-date petrol and diesel prices.
          </p>
          
          <h2 className="text-xl font-bold text-white mt-8 mb-3">The Cost of Driving</h2>
          <p className="text-sm">
            With the rising cost of living, every penny counts. Fuel is a significant expense for millions of motorists across the country, yet finding the cheapest local station has historically been a guessing game. Prices can vary wildly even between stations located just a few miles apart.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-3">Powered by Open Data</h2>
          <p className="text-sm">
            We leverage the power of the Competition and Markets Authority (CMA) Open Data scheme. This initiative requires major fuel retailers to publish their live pricing data, allowing us to aggregate and present this information directly to you in a fast, easy-to-use interface.
          </p>

          <h2 className="text-xl font-bold text-white mt-8 mb-3">New Tools for Smarter Savings</h2>
          <p className="text-sm">
            We are constantly expanding our platform to give you the most comprehensive view of the UK fuel market. Our latest additions are designed to give drivers unparalleled insight:
          </p>
          <ul className="list-disc pl-5 space-y-2 mt-3 text-sm">
            <li><strong className="text-emerald-400">The City Directory:</strong> We now track the absolute cheapest fuel prices across 96 major UK cities using localized radius searches. Whether you're at home or travelling, finding the most competitive local stations has never been easier.</li>
            <li><strong className="text-emerald-400">Daily UK Price History:</strong> To give drivers historical market context and reveal pricing volatility, our new 7-day trend graph records the national average fuel prices daily. Time your fill-ups perfectly by understanding the broader market trends.</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-3">Why Choose Us?</h2>
          <ul className="list-disc pl-5 space-y-2 text-sm">
            <li><strong>Live Updates:</strong> Our feeds pull the latest available data straight from the retailers.</li>
            <li><strong>Location-Based:</strong> Quickly find the best prices near your current location or any UK postcode.</li>
            <li><strong>Completely Free:</strong> No paywalls, no hidden fees—just free access to the data you need to make informed decisions at the pump.</li>
          </ul>

          <h2 className="text-xl font-bold text-white mt-8 mb-3">Get in Touch</h2>
          <p className="text-sm">
            We are constantly working to improve Pumpprice.live. If you have feedback, suggestions, or just want to say hello, we'd love to hear from you. Check out our <Link to="/blog" className="text-emerald-400 hover:underline">Blog</Link> for more tips on maximizing your fuel efficiency and staying updated on market trends.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default About;
