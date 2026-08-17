const fs = require('fs');
const path = require('path');

const stylesDir = path.join(__dirname, 'src', 'styles', 'pages');
const files = fs.readdirSync(stylesDir).filter(f => f.endsWith('.css'));

const regexList = [
  {
    regex: /\.([a-zA-Z0-9_-]+) \{\s*max-width: 1280px;\s*margin-left: auto;\s*margin-right: auto;\s*padding: (?:2rem|3rem|4rem|6rem|1rem) 1rem;\s*\}\s*@media \(min-width: 640px\) \{\s*\.\1 \{\s*padding-left: 1\.5rem;\s*padding-right: 1\.5rem;\s*\}\s*\}\s*@media \(min-width: 1024px\) \{\s*\.\1 \{\s*padding-left: 2rem;\s*padding-right: 2rem;\s*\}\s*\}/g,
    replace: '.$1 {\n  max-width: 1280px;\n  margin-left: auto;\n  margin-right: auto;\n  padding: var(--spacing-page-y) var(--spacing-container-px);\n}'
  },
  {
    regex: /\.([a-zA-Z0-9_-]+) \{\s*padding-top: (?:2rem|3rem|4rem|6rem|1rem);\s*padding-bottom: (?:2rem|3rem|4rem|6rem|1rem);\s*\}\s*@media \(min-width: 640px\) \{\s*\.\1 \{\s*padding-left: 1\.5rem;\s*padding-right: 1\.5rem;\s*\}\s*\}\s*@media \(min-width: 1024px\) \{\s*\.\1 \{\s*padding-left: 2rem;\s*padding-right: 2rem;\s*\}\s*\}/g,
    replace: '.$1 {\n  padding: var(--spacing-page-y) var(--spacing-container-px);\n}'
  },
  {
    regex: /\.([a-zA-Z0-9_-]+) \{\s*max-width: 1280px;\s*margin-left: auto;\s*margin-right: auto;\s*padding-left: 1rem;\s*padding-right: 1rem;\s*padding-top: (?:2rem|3rem|4rem|6rem|1rem);\s*padding-bottom: (?:2rem|3rem|4rem|6rem|1rem);\s*\}\s*@media \(min-width: 640px\) \{\s*\.\1 \{\s*padding-left: 1\.5rem;\s*padding-right: 1\.5rem;\s*\}\s*\}\s*@media \(min-width: 1024px\) \{\s*\.\1 \{\s*padding-left: 2rem;\s*padding-right: 2rem;\s*\}\s*\}/g,
    replace: '.$1 {\n  max-width: 1280px;\n  margin-left: auto;\n  margin-right: auto;\n  padding: var(--spacing-page-y) var(--spacing-container-px);\n}'
  }
];

files.forEach(file => {
  const filePath = path.join(stylesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  let original = content;
  regexList.forEach(({regex, replace}) => {
    content = content.replace(regex, replace);
  });
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
