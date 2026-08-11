const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  fs.readdirSync(dir).forEach(file => {
    const dirFile = path.join(dir, file);
    try {
      filelist = walkSync(dirFile, filelist);
    } catch (err) {
      if (err.code === 'ENOTDIR' || err.code === 'EBADF') {
        if (dirFile.endsWith('.tsx') || dirFile.endsWith('.ts')) {
          filelist.push(dirFile);
        }
      } else {
        throw err;
      }
    }
  });
  return filelist;
};

const files = walkSync('./src');

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  
  // Replace red colors
  content = content.replace(/text-red-500/g, 'text-brand-accent');
  content = content.replace(/hover:text-red-500/g, 'hover:text-brand-accent');
  content = content.replace(/hover:text-red-600/g, 'hover:text-brand-accent-hover');
  content = content.replace(/bg-red-500/g, 'bg-brand-accent');
  content = content.replace(/hover:bg-red-600/g, 'hover:bg-brand-accent-hover');
  content = content.replace(/border-red-500/g, 'border-brand-accent');
  content = content.replace(/ring-red-500/g, 'ring-brand-accent');
  content = content.replace(/focus:ring-red-500/g, 'focus:ring-brand-accent');
  content = content.replace(/focus:border-red-500/g, 'focus:border-brand-accent');
  
  // Backgrounds and borders
  content = content.replace(/bg-\[#1a1a1a\]/g, 'bg-brand-bg');
  content = content.replace(/bg-\[#1f1f1f\]/g, 'bg-brand-bg');
  content = content.replace(/bg-\[#2a2a2a\]/g, 'bg-brand-bg/80'); // approximate
  content = content.replace(/bg-\[#111111\]/g, 'bg-black/40');
  content = content.replace(/bg-\[#222222\]/g, 'bg-brand-border'); // usually cards
  content = content.replace(/bg-\[#333333\]/g, 'bg-brand-border/80');
  
  content = content.replace(/border-\[#333333\]/g, 'border-brand-border');
  content = content.replace(/border-\[#2a2a2a\]/g, 'border-brand-border');
  content = content.replace(/border-\[#222222\]/g, 'border-brand-border/50');
  
  // Texts
  content = content.replace(/text-white/g, 'text-brand-text-primary');
  content = content.replace(/text-gray-100/g, 'text-brand-text-primary');
  content = content.replace(/text-gray-300/g, 'text-brand-text-secondary');
  content = content.replace(/text-gray-400/g, 'text-brand-text-secondary');
  content = content.replace(/text-gray-500/g, 'text-brand-text-secondary');
  
  fs.writeFileSync(file, content, 'utf8');
});

console.log('Styles updated.');
