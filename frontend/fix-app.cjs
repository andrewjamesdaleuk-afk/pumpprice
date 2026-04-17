const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Inject isStale
code = code.replace(
  `        return {
          id: st.site_id || i,`,
  `        const isStale = st.recorded_at ? (new Date().getTime() - new Date(st.recorded_at).getTime()) / (1000 * 60 * 60) > 12 : true;
        
        return {
          id: st.site_id || i,
          isStale,`
);

// 2. Exclude stale stations from stats logic
code = code.replace(
  `const prices = mappedResults.map(r => r.price).filter(p => p > 0);`,
  `const prices = mappedResults.filter(r => !r.isStale).map(r => r.price).filter(p => p > 0);`
);

// 3. Fix the rendering loop:
// From: {results.map((station, index) => {
// To: 
/*
              const freshStations = results.filter(s => !s.isStale);
              const staleStations = results.filter(s => s.isStale);
              
              return (
                <div className="flex flex-col gap-4 relative z-10 pb-12">
                  {freshStations.map((station, index) => {
*/

const oldRenderStart = `{results.map((station, index) => {
                return (
                <div key={station.id} className="space-y-4">
                  <div className="flex flex-col">
                    <div 
                      className={\`relative bg-slate-900 p-5 border transition-all \${fuelType === 'diesel' ? 'hover:border-sky-500/50' : 'hover:border-emerald-500/50'} \${index === 0 ? (fuelType === 'diesel' ? 'rounded-t-2xl border-sky-500/30 shadow-lg shadow-sky-500/10' : 'rounded-t-2xl border-emerald-500/30 shadow-lg shadow-emerald-500/10') : 'rounded-2xl border-slate-800'}\`}
                    >`;

const newRenderStart = `
              {results.filter(s => !s.isStale).map((station, index) => {
                return (
                <div key={station.id} className="space-y-4">
                  <div className="flex flex-col">
                    <div 
                      className={\`relative bg-slate-900 p-5 border transition-all \${fuelType === 'diesel' ? 'hover:border-sky-500/50' : 'hover:border-emerald-500/50'} \${index === 0 ? (fuelType === 'diesel' ? 'rounded-t-2xl border-sky-500/30 shadow-lg shadow-sky-500/10' : 'rounded-t-2xl border-emerald-500/30 shadow-lg shadow-emerald-500/10') : 'rounded-2xl border-slate-800'}\`}
                    >
`;

if (code.includes(oldRenderStart)) {
    code = code.replace(oldRenderStart, newRenderStart);
} else {
    console.log("Could not find oldRenderStart!");
}

const oldRenderEnd = `              })}
            </div>
          </section>`;

const newRenderEnd = `              })}
              
              {results.filter(s => s.isStale).length > 0 && (
                <div className="mt-8 mb-2">
                  <h2 className="text-xl font-bold text-slate-300 px-1 border-b border-slate-800 pb-2">Fuel stations with stale data</h2>
                </div>
              )}
              
              {results.filter(s => s.isStale).map((station) => (
                <div key={station.id} className="space-y-4 opacity-75">
                  <div className="flex flex-col">
                    <div className="relative bg-slate-900/50 p-5 border border-slate-800/50 rounded-2xl">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg text-slate-400">{station.brand}</h3>
                            {station.isMotorway && (
                              <span className="bg-amber-500/10 text-amber-500/50 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider border border-amber-500/20">
                                Motorway
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-slate-500 mt-0.5">{station.address}</p>
                          <p className="text-xs text-slate-600 mt-2 flex items-center gap-1">
                            <Navigation className="w-3 h-3" /> {station.distance}
                          </p>
                        </div>
                        <div className="text-right flex flex-col items-end">
                           {/* Empty space where price used to be */}
                           <div className="h-8"></div>
                           <div className="text-[10px] text-slate-600 font-medium mt-1 pr-1">
                            Updated: {station.lastUpdated}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>`;

if (code.includes(oldRenderEnd)) {
    code = code.replace(oldRenderEnd, newRenderEnd);
} else {
    console.log("Could not find oldRenderEnd!");
}

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx updated!');
