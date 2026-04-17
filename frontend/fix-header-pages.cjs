const fs = require('fs');

const headerJSX = `      <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sticky top-0 z-[100] shadow-sm">
        <div className="max-w-md mx-auto flex items-center justify-between relative px-6">
          <div className="w-10 h-10"></div>
          <h1 className="text-3xl font-black font-display tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-emerald-100 to-emerald-500 uppercase">
            Pumpprice
          </h1>
          <div className="w-10 h-10"></div>
        </div>
      </header>
`;

function addHeader(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  const searchStr = '<div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500/30">\n      <div className="max-w-md mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">';
  const replaceStr = '<div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500/30">\n' + headerJSX + '      <div className="max-w-md mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">';
  
  if (code.includes(searchStr)) {
    code = code.replace(searchStr, replaceStr);
    fs.writeFileSync(file, code);
    console.log(`Added header to ${file}!`);
  } else {
    console.log(`Could not find target string in ${file}.`);
  }
}

addHeader('src/components/Login.tsx');
addHeader('src/components/Account.tsx');
