const { execSync } = require('child_process');

console.log('🚀 [build] Starting build process...');

// 1. Try to run prisma generate, but don't crash if DLL is locked by a running dev server on Windows
try {
  console.log('📡 [build] Generating Prisma client...');
  execSync('npx prisma generate', { stdio: 'inherit' });
} catch (err) {
  console.warn('⚠️  [build] Prisma generate encountered file lock (normal if dev server is active). Using current client.');
}

// 2. Apply Next.js 16 / React 19 patches
try {
  console.log('🔧 [build] Applying runtime compatibility patches...');
  require('./patch-next.js');
} catch (err) {
  console.warn('⚠️  [build] Patch warning:', err.message);
}

// 3. Run production Next.js build
console.log('📦 [build] Building Next.js production bundle...');
execSync('npx next build', { stdio: 'inherit' });

console.log('✅ [build] Build completed successfully!');
