import { Link } from 'react-router-dom';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="w-full px-6 py-6 border-t border-slate-800/50 mt-6 bg-slate-950/50 text-center pb-20">
      <div className="max-w-xl mx-auto flex flex-col items-center">
        <p className="text-xs font-medium text-slate-500 mb-5 max-w-[280px] leading-relaxed">
          Data provided by CMA Open Data feeds.<br/>Prices updated dynamically.
        </p>
        
        <div className="flex flex-row flex-wrap justify-center items-center gap-x-4 gap-y-2 text-[13px] font-semibold mb-6">
          <Link to="/about" className="text-emerald-400 hover:text-emerald-300 transition-colors px-2 py-1">About</Link>
          <span className="text-slate-800 text-[10px]">&bull;</span>
          <Link to="/blog" className="text-emerald-400 hover:text-emerald-300 transition-colors px-2 py-1">Guides</Link>
          <span className="text-slate-800 text-[10px]">&bull;</span>
          <Link to="/insights" className="text-emerald-400 hover:text-emerald-300 transition-colors px-2 py-1">Insights</Link>
          <span className="text-slate-800 text-[10px]">&bull;</span>
          <Link to="/locations" className="text-emerald-400 hover:text-emerald-300 transition-colors px-2 py-1">Cities</Link>
          <span className="text-slate-800 text-[10px]">&bull;</span>
          <Link to="/privacy" className="text-emerald-400 hover:text-emerald-300 transition-colors px-2 py-1">Privacy</Link>
        </div>
        
        <p className="text-[11px] font-medium text-slate-600">
          &copy; {year} Pumpprice.live. All rights reserved.
        </p>
      </div>
    </footer>
  );
}