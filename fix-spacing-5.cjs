const fs = require('fs');
const path = require('path');

const stylesDir = path.join(__dirname, 'src', 'styles', 'components');
const files = fs.readdirSync(stylesDir).filter(f => f.endsWith('.css'));

files.forEach(file => {
  const filePath = path.join(stylesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  const regex1 = /\.([a-zA-Z0-9_-]+)\s*\{\s*max-width:\s*([^;]+);\s*margin-left:\s*auto;\s*margin-right:\s*auto;\s*padding-left:\s*1rem;\s*padding-right:\s*1rem;\s*\}\s*@media\s*\(min-width:\s*640px\)\s*\{\s*\.\1\s*\{\s*padding-left:\s*1\.5rem;\s*padding-right:\s*1\.5rem;\s*\}\s*\}\s*@media\s*\(min-width:\s*1024px\)\s*\{\s*\.\1\s*\{\s*padding-left:\s*2rem;\s*padding-right:\s*2rem;\s*\}\s*\}/g;
  content = content.replace(regex1, '.$1 {\n  max-width: $2;\n  margin-left: auto;\n  margin-right: auto;\n  padding-left: var(--spacing-container-px);\n  padding-right: var(--spacing-container-px);\n}');

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
