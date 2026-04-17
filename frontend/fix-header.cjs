const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// The main layout cards have a margin (e.g., mx-6 or px-6 on the section). 
// The header currently has px-6 on the wrapper, but the inner div is 'max-w-md mx-auto'.
// To perfectly align the icon with the right edge of the cards, we need to match the horizontal padding of the cards.

code = code.replace(
  '<header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 px-6 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sticky top-0 z-[100] shadow-sm">',
  '<header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] sticky top-0 z-[100] shadow-sm">'
);

code = code.replace(
  '<div className="max-w-md mx-auto flex items-center justify-between relative">',
  '<div className="max-w-md mx-auto flex items-center justify-between relative px-6">'
);

fs.writeFileSync('src/App.tsx', code);
console.log('Header alignment updated!');
