const fs = require('fs');
const path = require('path');

const replacements = [
  [/@\/components/g, '@frontend/components'],
  [/@\/hooks/g, '@frontend/hooks'],
  [/@\/lib\/cognee/g, '@backend/services/cognee'],
  [/@\/lib\/gemini/g, '@backend/services/gemini'],
  [/@\/lib\/db/g, '@backend/database/db'],
  [/@\/lib\/schema/g, '@shared/types/schema'],
  [/@\/lib\/utils/g, '@shared/utils/utils'],
  [/@\/utils/g, '@shared/utils'],
  [/@\/constants/g, '@shared/constants'],
  [/@\/config/g, '@shared/config']
];

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next') && !file.includes('.git')) {
        results = results.concat(walk(file));
      }
    } else {
      if (file.endsWith('.ts') || file.endsWith('.tsx')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk(process.cwd());
let changedCount = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let newContent = content;
  
  replacements.forEach(([regex, replacement]) => {
    newContent = newContent.replace(regex, replacement);
  });
  
  if (content !== newContent) {
    fs.writeFileSync(file, newContent, 'utf8');
    changedCount++;
  }
});

console.log(`Updated ${changedCount} files.`);
