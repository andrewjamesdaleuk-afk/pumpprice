const fs = require('fs');

function addBackground(file) {
  let code = fs.readFileSync(file, 'utf8');
  // Change the outer wrapper to take up the full screen height and apply the bg-slate-950 background
  code = code.replace(
    '<div className="max-w-md mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">',
    '<div className="min-h-screen bg-slate-950 text-slate-50 font-sans selection:bg-emerald-500/30">\n      <div className="max-w-md mx-auto px-6 py-12 animate-in fade-in slide-in-from-bottom-4 duration-500">'
  );
  
  // Close the new div at the bottom of the component
  const lastReturn = code.lastIndexOf(');');
  if (lastReturn !== -1) {
      code = code.substring(0, lastReturn) + '    </div>\n' + code.substring(lastReturn);
  }
  
  fs.writeFileSync(file, code);
  console.log(`Updated ${file} background!`);
}

addBackground('src/components/Login.tsx');
addBackground('src/components/Account.tsx');
