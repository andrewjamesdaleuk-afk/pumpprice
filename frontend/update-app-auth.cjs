const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add imports
code = code.replace(
  "import { useState, useEffect } from 'react';",
  "import { useState, useEffect, useCallback } from 'react';\nimport { AuthProvider, useAuth } from './contexts/AuthContext';\nimport { Login } from './components/Login';\nimport { Account } from './components/Account';\nimport { User as UserIcon } from 'lucide-react';"
);

// 2. Wrap App content and move logic to AppContent
const appMatch = code.match(/export default function App\(\) \{([\s\S]*?)return \(([\s\S]*?)\);\n\}/);
if (appMatch) {
  const innerLogic = appMatch[1];
  const innerJSX = appMatch[2];

  const newAppCode = `
function AppContent() {
  const { user, profile, loading: authLoading } = useAuth();
  const [view, setView] = useState<'home' | 'login' | 'account'>('home');
  ${innerLogic.replace(/export default function App\(\) \{/, '').trim()}

  // Personalization Effect
  useEffect(() => {
    if (profile && !showResults && !loading) {
      if (profile.postcode) {
        setStartPostcode(profile.postcode);
      }
      if (profile.fuel_preference) {
        setFuelType(profile.fuel_preference);
      }
      setSearchMode('local');
    }
  }, [profile]);

  if (view === 'login') return <Login onBack={() => setView('home')} onSuccess={() => setView('home')} />;
  if (view === 'account') return <Account onBack={() => setView('home')} />;

  return (${innerJSX});
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
`;
  code = code.replace(appMatch[0], newAppCode);
}

// 3. Add User Icon to Header
code = code.replace(
  '<h1 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center gap-2">',
  '<div className="w-full flex justify-between items-center relative">\n          <div className="w-8 h-8 opacity-0"></div>\n          <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic flex items-center gap-2">'
);

code = code.replace(
  'Pumpprice\n          </h1>',
  'Pumpprice\n          </h1>\n          <button \n            onClick={() => user ? setView(\'account\') : setView(\'login\')}\n            className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"\n          >\n            <UserIcon className="w-5 h-5" />\n          </button>\n        </div>'
);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx updated with Auth integration!');
