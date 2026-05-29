const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  if (!fs.existsSync(dir)) return;
  fs.readdirSync(dir).forEach(f => {
    const dirPath = path.join(dir, f);
    const isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

// Color token replacements: old -> new
// Order matters! Longer/more specific strings first to avoid partial matches
const TOKEN_REPLACEMENTS = [
  // Backgrounds
  ['bg-\\[#FAFAF8\\]', 'bg-[#f8f7fc]'],
  ['bg-stone-950', 'bg-[#1a1625]'],
  ['bg-stone-900/50', 'bg-[#261f35]'],
  ['bg-stone-900', 'bg-[#1a1625]'],
  ['bg-stone-800', 'bg-[#2d2540]'],
  ['bg-stone-100', 'bg-purple-50'],
  ['bg-stone-50', 'bg-[#f8f7fc]'],

  // Borders
  ['border-stone-900', 'border-[#2d2540]'],
  ['border-stone-800', 'border-[#2d2540]'],
  ['border-stone-200', 'border-[#ede9f6]'],
  ['border-stone-100', 'border-[#f3f0fa]'],

  // Text
  ['text-stone-900', 'text-[#1a1625]'],
  ['text-stone-800', 'text-[#1a1625]'],
  ['text-stone-700', 'text-[#3d3551]'],
  ['text-stone-600', 'text-[#4b4568]'],
  ['text-stone-500', 'text-[#6b7280]'],
  ['text-stone-400', 'text-[#9ca3af]'],

  // Amber -> Pink primary
  ['text-amber-700', 'text-[#c4177a]'],
  ['text-amber-600', 'text-[#e91e8c]'],
  ['text-amber-500', 'text-[#e91e8c]'],
  ['text-amber-400', 'text-pink-400'],
  ['bg-amber-600', 'bg-[#e91e8c]'],
  ['bg-amber-500', 'bg-[#e91e8c]'],
  ['bg-amber-50', 'bg-[#fdf2f8]'],
  ['bg-amber-100', 'bg-[#fce7f3]'],
  ['border-amber-600', 'border-[#e91e8c]'],
  ['border-amber-500', 'border-[#e91e8c]'],
  ['border-amber-400', 'border-pink-300'],
  ['border-amber-300', 'border-pink-200'],
  ['border-amber-200', 'border-[#fce7f3]'],
  ['focus:border-amber-500', 'focus:border-[#e91e8c]'],
  ['focus:ring-amber-500', 'focus:ring-[#e91e8c]'],
  ['ring-amber-500', 'ring-[#e91e8c]'],
  ['hover:text-amber-500', 'hover:text-[#e91e8c]'],
  ['hover:text-amber-700', 'hover:text-[#c4177a]'],
  ['hover:bg-amber-50', 'hover:bg-[#fdf2f8]'],
  ['shadow-amber-500', 'shadow-pink-500'],

  // Hover states
  ['hover:bg-stone-900', 'hover:bg-[#261f35]'],
  ['hover:bg-stone-800', 'hover:bg-[#261f35]'],
  ['hover:bg-stone-50', 'hover:bg-[#f8f7fc]'],
  ['hover:bg-stone-100', 'hover:bg-purple-50'],
  ['hover:border-stone-300', 'hover:border-[#ddd6fe]'],
  ['hover:text-stone-900', 'hover:text-[#1a1625]'],

  // White bg cards -> pure white
  ['bg-white', 'bg-white'],

  // Rounded values (keep large radii)
  // (no change needed)

  // Font
  ['font-sans', 'font-[family-name:var(--font-dm-sans)]'],
];

// Regex-based replacements for homepage & pricing page
const REGEX_REPLACEMENTS = [
  // gradient with amber
  [/from-amber-\d+/g, 'from-pink-500'],
  [/to-amber-\d+/g, 'to-purple-600'],
  [/via-amber-\d+/g, 'via-pink-400'],
];

function applyReplacements(content) {
  let result = content;

  // Apply token replacements (class-name safe)
  for (const [from, to] of TOKEN_REPLACEMENTS) {
    if (from === to) continue;
    try {
      // Match as a whole class token in className strings
      const escaped = from.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const regex = new RegExp('(?<=["\' ])' + escaped + '(?=["\' ]|$)', 'g');
      result = result.replace(regex, to);
    } catch(e) {
      // fallback: simple string replace
      result = result.split(from).join(to);
    }
  }

  // Apply regex replacements
  for (const [pattern, replacement] of REGEX_REPLACEMENTS) {
    result = result.replace(pattern, replacement);
  }

  return result;
}

// Process dashboard inner pages (NOT layout.tsx which is already done)
const dirs = [
  'src/app/(dashboard)/dashboard',
  'src/app/(dashboard)/customers',
  'src/app/(dashboard)/invoices',
  'src/app/(dashboard)/jobs',
  'src/app/(dashboard)/review',
  'src/app/pricing',
];

const rootDir = path.join(__dirname);
let updatedCount = 0;

for (const rel of dirs) {
  const absDir = path.join(rootDir, rel);
  walkDir(absDir, (filePath) => {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
    // Skip already-refactored layout
    if (filePath.includes('layout.tsx')) return;
    
    const original = fs.readFileSync(filePath, 'utf8');
    const updated = applyReplacements(original);
    if (updated !== original) {
      fs.writeFileSync(filePath, updated, 'utf8');
      console.log('✓ Updated:', path.relative(rootDir, filePath));
      updatedCount++;
    }
  });
}

console.log(`\nDone. ${updatedCount} file(s) updated.`);
