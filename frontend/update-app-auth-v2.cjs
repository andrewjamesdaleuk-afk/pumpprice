const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add imports
code = code.replace(
  "import { useState, useEffect } from 'react';",
  "import { useState, useEffect, useCallback } from 'react';\nimport { AuthProvider, useAuth } from './contexts/AuthContext';\nimport { Login } from './components/Login';\nimport { Account } from './components/Account';\nimport { User as UserIcon } from 'lucide-react';"
);

// 2. Wrap App content and move logic to AppContent
const oldExport = "export default function App() {";
const newAppStart = \`
function AppContent() {
  const { user, profile, loading: authLoading } = useAuth();
  const [view, setView] = useState<'home' | 'login' | 'account'>('home');
\`;
code = code.replace(oldExport, newAppStart);

// 3. Close AppContent and add AuthProvider wrapper
const lastLine = "  );";
const closingApp = \`
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
\`;

// Replace ONLY the last occurrence of ); }
const lastIndex = code.lastIndexOf(");\\n}");
if (lastIndex !== -1) {
    code = code.substring(0, lastIndex) + closingApp;
}

// 4. Personalization Effect - Inject after standard useEffects
code = code.replace(
  "  useEffect(() => {\\n    if (showResults && results.length > 0) {",
  \`  useEffect(() => {
    if (profile && !showResults && !loading) {
      if (profile.postcode) {
        setStartPostcode(profile.postcode);
      }
      if (profile.fuel_preference) {
        setFuelType(profile.fuel_preference as 'petrol' | 'diesel');
      }
      setSearchMode('local');
    }
  }, [profile]);

  useEffect(() => {
    if (showResults && results.length > 0) {\`
);

// 5. View management
code = code.replace(
  "  return (\\n    <div className=\\\"min-h-screen",
  \`  if (view === 'login') return <Login onBack={() => setView('home')} onSuccess={() => setView('home')} />;
  if (view === 'account') return <Account onBack={() => setView('home')} />;

  return (
    <div className="min-h-screen\`
);

// 6. Fix Header to include Login button
const headerStart = '<div className="max-w-md mx-auto flex items-center justify-center">';
const newHeader = \`
        <div className="max-w-md mx-auto flex items-center justify-between relative px-1">
          <div className="w-8 h-8"></div>
\`;
code = code.replace(headerStart, newHeader);

const headerEnd = '</h1>';
const newHeaderEnd = \`</h1>
          <button 
            onClick={() => user ? setView('account') : setView('login')}
            className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <UserIcon className="w-5 h-5" />
          </button>
\`;
code = code.replace(headerEnd, newHeaderEnd);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx updated with clean Auth integration!');
