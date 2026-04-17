const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Fix the input text color conditional
code = code.replace(
  "className={`w-full bg-slate-950/80 backdrop-blur border border-slate-700 rounded-xl px-4 py-3 pr-12 text-base outline-none ${startPostcode === 'Current location' ? 'text-emerald-400 font-bold normal-case' : 'text-white uppercase'} placeholder-slate-500 transition-all focus:ring-2 ${fuelType === 'diesel' ? 'focus:border-sky-400 focus:ring-sky-500/30' : 'focus:border-emerald-400 focus:ring-emerald-500/30'}`}",
  "className={`w-full bg-slate-950/80 backdrop-blur border border-slate-700 rounded-xl px-4 py-3 pr-12 text-base outline-none ${startPostcode === 'Current location' ? (fuelType === 'diesel' ? 'text-sky-400' : 'text-emerald-400') + ' font-bold normal-case' : 'text-white uppercase'} placeholder-slate-500 transition-all focus:ring-2 ${fuelType === 'diesel' ? 'focus:border-sky-400 focus:ring-sky-500/30' : 'focus:border-emerald-400 focus:ring-emerald-500/30'}`}"
);

// 2. Fix the button hover color
code = code.replace(
  'className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-emerald-400 transition-colors"',
  'className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 transition-colors ${fuelType === "diesel" ? "hover:text-sky-400" : "hover:text-emerald-400"}`}'
);

// 3. Fix the active icon color
code = code.replace(
  "className={`w-5 h-5 ${startPostcode === 'Current location' ? 'text-emerald-400' : ''}`}",
  "className={`w-5 h-5 ${startPostcode === 'Current location' ? (fuelType === 'diesel' ? 'text-sky-400' : 'text-emerald-400') : ''}`}"
);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx colors updated to match fuel type!');
