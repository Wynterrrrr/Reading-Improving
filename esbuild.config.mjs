import esbuild from 'esbuild';
import { readFile } from 'node:fs/promises';

const manifest = JSON.parse(await readFile(new URL('./manifest.json', import.meta.url), 'utf8').catch(() => '{"version":"0.0.1"}'));
const production = process.argv.includes('--production');
const watch = process.argv.includes('--watch');

const options = {
  entryPoints: ['src/main.ts'],
  bundle: true,
  external: [
    'obsidian',
    'electron',
    '@codemirror/*',
    '@lezer/*',
    'fflate',
    'fast-xml-parser',
    'linkedom',
    'node:*',
  ],
  format: 'cjs',
  target: 'es2018',
  logLevel: 'info',
  sourcemap: production ? false : 'inline',
  outfile: 'main.js',
  banner: {
    js: `/* Reading Improving ${manifest.version} */`,
  },
};

if (watch) {
  const context = await esbuild.context(options);
  await context.watch();
  console.log('watching for changes');
} else {
  await esbuild.build(options);
}
