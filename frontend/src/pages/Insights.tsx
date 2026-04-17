import { Link } from 'react-router-dom';
import { ArrowRight, Lightbulb } from 'lucide-react';
import { Footer } from '../components/Footer';
import { BrandLeaderboard } from '../components/BrandLeaderboard';
import { GovernmentCutInsight } from '../components/GovernmentCutInsight';
import { ExpensiveCitiesInsight } from '../components/ExpensiveCitiesInsight';
import { CheapestCitiesInsight } from '../components/CheapestCitiesInsight';
import { PremiumGapInsight } from '../components/PremiumGapInsight';

export default function Insights() {
  const insights: any[] = [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500/30 pb-20">
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sticky top-0 z-[100] shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between relative px-6">
          <Link 
            to="/"
            className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
          </Link>
          <h1 className="text-2xl font-black font-display tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-100 to-emerald-500 uppercase">
            Pumpprice Insights
          </h1>
          <div className="w-10 h-10"></div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
            <Lightbulb className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Data Insights Hub</h2>
            <p className="text-sm text-slate-400">Deep dives into fuel prices, trends, and analytics.</p>
          </div>
        </div>

        <GovernmentCutInsight />
        <BrandLeaderboard />
        <ExpensiveCitiesInsight />
        <CheapestCitiesInsight />
        <PremiumGapInsight />

        <div className="space-y-4 mt-8">
          {insights.length === 0 ? (
            <div className="text-center py-10 bg-slate-900/50 rounded-2xl border border-slate-800">
              <p className="text-slate-400 text-sm">More articles and features coming soon.</p>
            </div>
          ) : (
            insights.map(post => (
              <Link 
                key={post.slug} 
                to={`/insights/${post.slug}`}
                className="block bg-slate-900 rounded-2xl p-5 border border-slate-800 hover:border-emerald-500/30 transition-all hover:shadow-lg hover:shadow-emerald-500/5 group"
              >
                <div className="text-xs font-semibold text-emerald-500 mb-2 uppercase tracking-wider">{post.category}</div>
                <h3 className="font-bold text-lg text-white mb-2 group-hover:text-emerald-400 transition-colors">{post.title}</h3>
                <p className="text-sm text-slate-400 line-clamp-2 mb-4">{post.excerpt}</p>
                <div className="text-xs text-slate-500 flex items-center gap-2">
                  {post.date} • {post.readTime} read
                </div>
              </Link>
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
