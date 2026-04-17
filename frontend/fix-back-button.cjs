const fs = require('fs');

function fixBackButton(file) {
  let code = fs.readFileSync(file, 'utf8');
  
  // 1. Remove the old back button from the main content area
  const oldButtonRegex = /      <button \n        onClick=\{onBack\}\n        className="text-slate-400 hover:text-white mb-8 flex items-center gap-2 text-sm transition-colors"\n      >\n        <ArrowRight className="w-4 h-4 rotate-180" \/> Back to Search\n      <\/button>\n\n/;
  code = code.replace(oldButtonRegex, '');

  // 2. Inject the back button into the left side of the header
  const oldHeaderLeft = '<div className="w-10 h-10"></div>';
  const newHeaderLeft = `          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <ArrowRight className="w-5 h-5 rotate-180" />
          </button>`;
          
  code = code.replace(oldHeaderLeft, newHeaderLeft);
  
  fs.writeFileSync(file, code);
  console.log(`Fixed back button in ${file}`);
}

fixBackButton('src/components/Login.tsx');
fixBackButton('src/components/Account.tsx');
