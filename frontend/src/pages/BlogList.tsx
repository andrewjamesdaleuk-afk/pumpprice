import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import { posts } from '../content/posts';
import { Footer } from '../components/Footer';

export default function BlogList() {
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
            Pumpprice Guides
          </h1>
          <div className="w-10 h-10"></div>
        </div>
      </header>

      <main className="max-w-md mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-slate-800 p-2.5 rounded-xl border border-slate-700">
            <BookOpen className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Fuel Savings Hub</h2>
            <p className="text-sm text-slate-400">Tips, news, and guides to cut your driving costs.</p>
          </div>
        </div>

        <div className="space-y-4">
          {[...posts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(post => (
            <Link 
              key={post.slug} 
              to={`/blog/${post.slug}`}
              className="block bg-slate-900 rounded-2xl p-5 border border-slate-800 hover:border-emerald-500/30 transition-all hover:shadow-lg hover:shadow-emerald-500/5 group"
            >
              <div className="text-xs font-semibold text-emerald-500 mb-2 uppercase tracking-wider">{post.category}</div>
              <h3 className="font-bold text-lg text-white mb-2 group-hover:text-emerald-400 transition-colors">{post.title}</h3>
              <p className="text-sm text-slate-400 line-clamp-2 mb-4">{post.excerpt}</p>
              <div className="text-xs text-slate-500 flex items-center gap-2">
                {post.date} • {post.readTime} read
              </div>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
