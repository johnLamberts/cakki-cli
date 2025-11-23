import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distPath = join(__dirname, '../dist/index.js');
const content = readFileSync(distPath, 'utf8');

if (!content.startsWith('#!/usr/bin/env node')) {
  writeFileSync(distPath, '#!/usr/bin/env node\n' + content);
  console.log('✅ Shebang added to dist/index.js');
}
