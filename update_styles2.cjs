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
  
  content = content.replace(/border-\[#3a3a3a\]/g, 'border-brand-border');
  content = content.replace(/bg-\[#222222\]/g, 'bg-brand-border'); // usually cards
  content = content.replace(/bg-\[#333333\]/g, 'bg-brand-border/80');
  content = content.replace(/border-\[#333333\]/g, 'border-brand-border');
  content = content.replace(/border-\[#2a2a2a\]/g, 'border-brand-border');
  content = content.replace(/border-\[#222222\]/g, 'border-brand-border/50');

  fs.writeFileSync(file, content, 'utf8');
});

console.log('Styles updated phase 2.');
