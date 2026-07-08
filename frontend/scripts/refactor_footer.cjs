const fs = require('fs');

const filesToUpdate = [
  { path: 'frontend/src/App.tsx', isRoot: true },
  { path: 'frontend/src/pages/BlogList.tsx', isRoot: false },
  { path: 'frontend/src/pages/BlogPost.tsx', isRoot: false },
  { path: 'frontend/src/pages/About.tsx', isRoot: false },
  { path: 'frontend/src/pages/LocalCity.tsx', isRoot: false },
  { path: 'frontend/src/pages/LocationsIndex.tsx', isRoot: false }
];

filesToUpdate.forEach(({ path, isRoot }) => {
  let content = fs.readFileSync(path, 'utf8');

  // Add the import
  const importStatement = isRoot 
    ? "import { Footer } from './components/Footer';\n"
    : "import { Footer } from '../components/Footer';\n";

  if (!content.includes('import { Footer }')) {
    // Add import after the last import statement
    const lastImportIndex = content.lastIndexOf('import ');
    const endOfLastImport = content.indexOf('\n', lastImportIndex);
    content = content.slice(0, endOfLastImport + 1) + importStatement + content.slice(endOfLastImport + 1);
  }

  // Replace the literal footer tags and their contents with <Footer />
  const footerRegex = /<footer[\s\S]*?<\/footer>/;
  content = content.replace(footerRegex, '<Footer />');

  fs.writeFileSync(path, content);
  console.log(`Updated footer in ${path}`);
});

