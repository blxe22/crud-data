import fs from 'node:fs';
import path from 'node:path';

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// 1. Copy static assets
console.log('Copying .next/static to .next/standalone/.next/static...');
copyDirSync('.next/static', '.next/standalone/.next/static');

// 2. Copy public directory
if (fs.existsSync('public')) {
  console.log('Copying public to .next/standalone/public...');
  copyDirSync('public', '.next/standalone/public');
}

console.log('Standalone build assets copied successfully!');
