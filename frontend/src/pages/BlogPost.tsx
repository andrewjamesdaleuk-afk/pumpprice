import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { posts } from '../content/posts';
import { Footer } from '../components/Footer';

export default function BlogPost() {
  const { slug } = useParams();
  const post = posts.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col items-center justify-center p-6">
        <h2 className="text-2xl font-bold mb-4">Article not found</h2>
        <Link 
          to="/blog"
          className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
        >
          <ArrowRight className="w-5 h-5 rotate-180" />
        </Link>
        <p className="mt-4 text-slate-400">Back to Guides</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500/30">
      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sticky top-0 z-[100] shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between relative px-6">
          <Link 
            to="/blog"
            className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
          </Link>
          <Link to="/" className="text-2xl font-black font-display tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-100 to-emerald-500 uppercase">
            Pumpprice
          </Link>
          <div className="w-10 h-10"></div>
        </div>
      </header>

      <article className="max-w-md mx-auto px-6 py-8 pb-24">
        <div className="mb-8">
          <div className="text-xs font-bold text-emerald-500 mb-3 uppercase tracking-wider">{post.category}</div>
          <h1 className="text-3xl font-black text-white leading-tight mb-4">{post.title}</h1>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>{post.date}</span>
            <span>•</span>
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {post.readTime}</span>
          </div>
        </div>

        <div 
          className="prose prose-invert prose-emerald max-w-none
                     prose-headings:font-bold prose-headings:text-white
                     prose-p:text-slate-300 prose-p:leading-relaxed
                     prose-a:text-emerald-400 prose-a:no-underline hover:prose-a:underline
                     prose-strong:text-white
                     prose-li:text-slate-300"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <div className="mt-12 pt-8 border-t border-slate-800">
          <div className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 rounded-2xl p-6 text-center">
            <h3 className="text-xl font-bold text-white mb-2">Stop overpaying for fuel.</h3>
            <p className="text-sm text-slate-400 mb-6">Check the live prices along your exact route before you fill up.</p>
            <Link 
              to="/" 
              className="inline-block w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black py-4 rounded-xl transition-all shadow-lg shadow-emerald-500/20"
            >
              Check Prices Near Me
            </Link>
          </div>
        </div>
      </article>

      <Footer />
    </div>
  );
}
