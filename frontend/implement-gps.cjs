const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add LocateFixed to imports
code = code.replace(
  "import { MapPin, Navigation, ArrowRight } from 'lucide-react';",
  "import { MapPin, Navigation, ArrowRight, LocateFixed, Loader2 } from 'lucide-react';"
);

// 2. Add userCoords state
code = code.replace(
  "const [startPostcode, setStartPostcode] = useState('');",
  "const [startPostcode, setStartPostcode] = useState('');\n  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);\n  const [locating, setLocating] = useState(false);"
);

// 3. Add handleUseMyLocation function
const handleUseMyLocationStr = `
  const handleUseMyLocation = () => {
    if (!navigator.geolocation) {
      setErrorMsg('Geolocation is not supported by your browser');
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setUserCoords({ lat: latitude, lng: longitude });
        setStartPostcode('Current location');
        setLocating(false);
        trackEvent('use_my_location_success');
      },
      (error) => {
        console.error('Geolocation error:', error);
        setErrorMsg('Could not get your location. Please check permissions.');
        setLocating(false);
        trackEvent('use_my_location_failed', { error: error.message });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };
`;

code = code.replace(
  "useEffect(() => {\n    trackPageView('Home');\n  }, []);",
  `useEffect(() => {
    trackPageView('Home');
  }, []);\n${handleUseMyLocationStr}`
);

// 4. Update handleSearch to use userCoords
const oldGeocodeLine = "const startCoords = await geocodePostcode(startPostcode);";
const newGeocodeLine = `      let startCoords;
      if (startPostcode === 'Current location' && userCoords) {
        startCoords = [userCoords.lng, userCoords.lat];
      } else {
        startCoords = await geocodePostcode(startPostcode);
      }`;
code = code.replace(oldGeocodeLine, newGeocodeLine);

// 5. Add crosshair icon to UI
const inputBlockRegex = /<input \s+type="text" \s+placeholder="e\.g\. SW1A 1AA" \s+className=\{`w-full bg-slate-950\/80 backdrop-blur border border-slate-700 rounded-xl px-4 py-3 text-base outline-none text-white placeholder-slate-500 transition-all uppercase focus:ring-2 \$\{fuelType === 'diesel' \? 'focus:border-sky-400 focus:ring-sky-500\/30' : 'focus:border-emerald-400 focus:ring-emerald-500\/30'\}`\}[\s\S]*?value=\{startPostcode\}[\s\S]*?onChange=\{e => setStartPostcode\(e\.target\.value\)\} \s*\/>/;

const newInputBlock = `<div className="relative">
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

code = code.replace(inputBlockRegex, newInputBlock);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx updated with GPS functionality!');
