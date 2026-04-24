import { cp, mkdir, stat } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const sourceDir = path.join(root, 'dist', 'pagefind');
const targetDir = path.join(root, 'public', 'pagefind');

async function exists(dir) {
  try {
    const file = await stat(dir);
    return file.isDirectory();
  } catch {
    return false;
  }
}

if (!(await exists(sourceDir))) {
  console.log('[search:sync] skip: dist/pagefind 不存在，保留当前 public/pagefind 状态');
  process.exit(0);
}

await mkdir(path.join(root, 'public'), { recursive: true });
await cp(sourceDir, targetDir, {
  recursive: true,
  force: true,
});

console.log('[search:sync] synced dist/pagefind -> public/pagefind');
