const fs = require('fs');
const path = require('path');

const stylesDir = path.join(__dirname, 'src', 'styles', 'pages');
const files = fs.readdirSync(stylesDir).filter(f => f.endsWith('.css'));

// This script aims to find patterns like:
// .some-class { ... padding-left: 1rem; padding-right: 1rem; ... }
// @media (min-width: 640px) { .some-class { padding-left: 1.5rem; padding-right: 1.5rem; } }
// @media (min-width: 1024px) { .some-class { padding-left: 2rem; padding-right: 2rem; } }
//
// And replace them with:
// .some-class { ... padding-left: var(--spacing-container-px); padding-right: var(--spacing-container-px); ... }

files.forEach(file => {
  const filePath = path.join(stylesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // We can use a regex that captures the class name, the content before padding, the content after padding, and the media queries.
  // We'll replace all variations of horizontal container padding.

  const regex1 = /\.([a-zA-Z0-9_-]+)\s*\{([^}]*?)padding-left:\s*1rem;\s*padding-right:\s*1rem;([^}]*?)\}\s*@media\s*\(min-width:\s*640px\)\s*\{\s*\.\1\s*\{\s*padding-left:\s*1\.5rem;\s*padding-right:\s*1\.5rem;\s*\}\s*\}\s*@media\s*\(min-width:\s*1024px\)\s*\{\s*\.\1\s*\{\s*padding-left:\s*2rem;\s*padding-right:\s*2rem;\s*\}\s*\}/g;
  
  content = content.replace(regex1, '.$1 {$2padding-left: var(--spacing-container-px);\n  padding-right: var(--spacing-container-px);$3}');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
