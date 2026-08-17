const fs = require('fs');
const path = require('path');

const walkSync = (dir, filelist = []) => {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filepath = path.join(dir, file);
    const stat = fs.statSync(filepath);
    if (stat.isDirectory()) {
      filelist = walkSync(filepath, filelist);
    } else if (file.endsWith('.tsx') || file.endsWith('.css')) {
      filelist.push(filepath);
    }
  }
  return filelist;
};

const allFiles = walkSync(path.join(__dirname, 'src'));

allFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  // Replace style={{ padding: '6rem 1rem' }} with style={{ padding: '6rem var(--spacing-container-px)' }} etc
  content = content.replace(/padding:\s*'([0-9.]+)rem\s+1rem'/g, "padding: '$1rem var(--spacing-container-px)'");
  content = content.replace(/padding:\s*'4rem\s+1rem'/g, "padding: 'var(--spacing-page-y) var(--spacing-container-px)'");
  content = content.replace(/padding:\s*'3rem\s+1rem'/g, "padding: 'var(--spacing-page-y) var(--spacing-container-px)'");
  content = content.replace(/padding:\s*'2rem\s+1rem'/g, "padding: 'var(--spacing-page-y) var(--spacing-container-px)'");
  
  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
});
