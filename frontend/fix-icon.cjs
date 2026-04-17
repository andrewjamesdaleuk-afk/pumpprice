const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const oldInput = `<input 
                  type="text" 
                  placeholder="e.g. SW1A 1AA" 
                  className={\`w-full bg-slate-950/80 backdrop-blur border border-slate-700 rounded-xl px-4 py-3 text-base outline-none text-white placeholder-slate-500 transition-all uppercase focus:ring-2 \${fuelType === 'diesel' ? 'focus:border-sky-400 focus:ring-sky-500/30' : 'focus:border-emerald-400 focus:ring-emerald-500/30'}\`}
                  value={startPostcode}
                  onChange={e => setStartPostcode(e.target.value)}
                />`;

const newInput = `<div className="relative">
                  <input 
                    type="text" 
                    placeholder="e.g. SW1A 1AA" 
                    className={\`w-full bg-slate-950/80 backdrop-blur border border-slate-700 rounded-xl px-4 py-3 pr-12 text-base outline-none \${startPostcode === 'Current location' ? 'text-emerald-400 font-bold normal-case' : 'text-white uppercase'} placeholder-slate-500 transition-all focus:ring-2 \${fuelType === 'diesel' ? 'focus:border-sky-400 focus:ring-sky-500/30' : 'focus:border-emerald-400 focus:ring-emerald-500/30'}\`}
                    value={startPostcode}
                    onChange={e => {
                      setStartPostcode(e.target.value);
                      if (userCoords) setUserCoords(null);
                    }}
                  />
                  <button
                    onClick={handleUseMyLocation}
                    disabled={locating}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-emerald-400 transition-colors"
                    title="Use my location"
                  >
                    {locating ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <LocateFixed className={\`w-5 h-5 \${startPostcode === 'Current location' ? 'text-emerald-400' : ''}\`} />
                    )}
                  </button>
                </div>`;

if(code.includes(oldInput)) {
  code = code.replace(oldInput, newInput);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Successfully injected icon!");
} else {
  console.log("Could not find the exact old input block.");
}
