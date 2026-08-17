const fs = require('fs');
const path = require('path');

const stylesDir = path.join(__dirname, 'src', 'styles', 'pages');
const files = fs.readdirSync(stylesDir).filter(f => f.endsWith('.css'));

files.forEach(file => {
  const filePath = path.join(stylesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace any @media (min-width: 640px) or 1024px that ONLY updates padding-left and padding-right
  content = content.replace(/@media\s*\(min-width:\s*640px\)\s*\{\s*\.([a-zA-Z0-9_-]+)\s*\{\s*padding-left:\s*1\.5rem;\s*padding-right:\s*1\.5rem;\s*\}\s*\}/g, '');
  content = content.replace(/@media\s*\(min-width:\s*1024px\)\s*\{\s*\.([a-zA-Z0-9_-]+)\s*\{\s*padding-left:\s*2rem;\s*padding-right:\s*2rem;\s*\}\s*\}/g, '');
  
  // Replace `padding: Xrem 1rem;` where X is 2, 3, 4, 6 with `padding: var(--spacing-page-y) var(--spacing-container-px);`
  content = content.replace(/padding:\s*([2346]rem|1rem)\s+1rem;/g, 'padding: var(--spacing-page-y) var(--spacing-container-px);');
  
  // Replace `padding-left: 1rem; \n padding-right: 1rem;` with var(--spacing-container-px)
  content = content.replace(/padding-left:\s*1rem;\s*padding-right:\s*1rem;/g, 'padding-left: var(--spacing-container-px);\n  padding-right: var(--spacing-container-px);');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
