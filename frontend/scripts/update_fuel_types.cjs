const fs = require('fs');

let stationsTS = fs.readFileSync('Pumpprice/frontend/src/services/stations.ts', 'utf8');

stationsTS = stationsTS.replace(
  "fuelType: 'petrol' | 'diesel'",
  "fuelType: 'petrol' | 'diesel' | 'premium_petrol' | 'premium_diesel'"
);

stationsTS = stationsTS.replace(
  "const fuelTypeParam = fuelType === 'petrol' ? 'E10' : 'B7';",
  "let fuelTypeParam = 'E10';\n    if (fuelType === 'diesel') fuelTypeParam = 'B7';\n    if (fuelType === 'premium_petrol') fuelTypeParam = 'E5';\n    if (fuelType === 'premium_diesel') fuelTypeParam = 'SDV';"
);

fs.writeFileSync('Pumpprice/frontend/src/services/stations.ts', stationsTS);

let appTSX = fs.readFileSync('Pumpprice/frontend/src/App.tsx', 'utf8');

appTSX = appTSX.replace(
  "const [fuelType, setFuelType] = useState<'petrol' | 'diesel'>('petrol');",
  "const [fuelType, setFuelType] = useState<'petrol' | 'diesel' | 'premium_petrol' | 'premium_diesel'>('petrol');"
);

// We need to inject a select dropdown or update the toggle buttons for fuel types.
// A select dropdown is much cleaner for 4 options than 4 buttons on mobile.
const originalToggle = `          {/* Fuel Type Toggle */}
          <div className="pt-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 block">Fuel Type</label>
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
              <button
                onClick={() => setFuelType('petrol')}
                className={\`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all \${fuelType === 'petrol' ? 'bg-emerald-500 text-slate-50 shadow-md' : 'text-slate-400 hover:text-white'}\`}
              >
                Petrol (E10)
              </button>
              <button
                onClick={() => setFuelType('diesel')}
                className={\`flex-1 py-2.5 text-sm font-bold rounded-lg transition-all \${fuelType === 'diesel' ? 'bg-emerald-500 text-slate-50 shadow-md' : 'text-slate-400 hover:text-white'}\`}
              >
                Diesel (B7)
              </button>
            </div>
          </div>`;

const newToggle = `          {/* Fuel Type Toggle */}
          <div className="pt-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 block">Fuel Type</label>
            <div className="relative">
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm font-bold focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-white appearance-none cursor-pointer transition-all"
              >
                <option value="petrol">Standard Petrol (E10)</option>
                <option value="diesel">Standard Diesel (B7)</option>
                <option value="premium_petrol">Super Unleaded (E5)</option>
                <option value="premium_diesel">Premium Diesel (SDV)</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
              </div>
            </div>
          </div>`;

appTSX = appTSX.replace(originalToggle, newToggle);

fs.writeFileSync('Pumpprice/frontend/src/App.tsx', appTSX);
console.log("Updated Fuel Types to include Premium options.");

