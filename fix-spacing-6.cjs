const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'styles', 'components', 'footer.css');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /\.footer-container\s*\{\s*max-width:\s*([^;]+);\s*margin-left:\s*auto;\s*margin-right:\s*auto;\s*padding-left:\s*1rem;\s*padding-right:\s*1rem;\s*padding-top:\s*4rem;\s*\/\*\s*pt-16\s*\*\/\s*padding-bottom:\s*3rem;\s*\/\*\s*pb-12\s*\*\/\s*\}\s*@media\s*\(min-width:\s*640px\)\s*\{\s*\.footer-container\s*\{\s*padding-left:\s*1\.5rem;\s*padding-right:\s*1\.5rem;\s*\}\s*\}\s*@media\s*\(min-width:\s*1024px\)\s*\{\s*\.footer-container\s*\{\s*padding-left:\s*2rem;\s*padding-right:\s*2rem;\s*\}\s*\}/g;

content = content.replace(regex, '.footer-container {\n  max-width: $1;\n  margin-left: auto;\n  margin-right: auto;\n  padding: var(--spacing-page-y) var(--spacing-container-px);\n}');

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Updated footer.css`);
