const fs = require('fs');

let content = fs.readFileSync('src/components/Header.tsx', 'utf8');

content = content.replace(/bg-\[#f8f8f8\]/g, 'bg-brand-surface');
content = content.replace(/text-gray-900/g, 'text-brand-text-dark');
content = content.replace(/text-gray-600/g, 'text-brand-text-dark/80');

fs.writeFileSync('src/components/Header.tsx', content, 'utf8');
