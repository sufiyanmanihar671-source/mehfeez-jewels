#!/usr/bin/env node
// Safe "validate → commit → push" workflow for Mehfeez Jewels.
//   node scripts/ship.mjs "feat: describe the change"
// 1. Refuses to run if secrets-looking files are staged.
// 2. Runs type checks, tests and a production build (npm run validate).
// 3. Only if everything passes: commits all changes and pushes (never force-pushes).
// Cloudflare Pages then deploys the pushed commit automatically via its GitHub integration.
import { execSync, spawnSync } from 'node:child_process';

const message = process.argv.slice(2).join(' ').trim();
if (!message) {
  console.error('Usage: node scripts/ship.mjs "<meaningful commit message>"');
  process.exit(1);
}

const sh = (cmd) => execSync(cmd, { encoding: 'utf8' }).trim();
// npm needs a shell on Windows (npm.cmd); git must NOT use one, or the commit
// message would be split into separate arguments.
const run = (cmd, args) =>
  spawnSync(cmd, args, { stdio: 'inherit', shell: process.platform === 'win32' && cmd === 'npm' }).status === 0;

const status = sh('git status --porcelain');
if (!status) {
  console.log('Nothing to commit.');
  process.exit(0);
}

const FORBIDDEN = [/(^|\/)\.env(\.|$)(?!example)/, /\.dev\.vars$/, /service[_-]?role/i, /\.pem$/, /\.key$/];
const files = status.split('\n').map((l) => l.slice(3).trim());
const bad = files.filter((f) => FORBIDDEN.some((re) => re.test(f)));
if (bad.length) {
  console.error('Refusing to commit files that may contain secrets:\n  ' + bad.join('\n  '));
  process.exit(1);
}
console.log('▶ Running validation (type check, tests, build)…');
if (!run('npm', ['run', 'validate'])) {
  console.error('✖ Validation failed — nothing was committed or pushed.');
  process.exit(1);
}

run('git', ['add', '-A']);
const staged = execSync('git diff --cached --no-color', { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
if (/service_role\s*[:=]|SUPABASE_SERVICE_ROLE_KEY\s*=|sb_secret_[A-Za-z0-9]/.test(staged)) {
  run('git', ['reset', '-q']);
  console.error('Refusing to commit: the changes appear to contain a Supabase service-role/secret key.');
  process.exit(1);
}
if (!run('git', ['commit', '-m', message])) process.exit(1);

const branch = sh('git rev-parse --abbrev-ref HEAD');
const hasRemote = sh('git remote').split('\n').includes('origin');
if (!hasRemote) {
  console.log('✔ Committed locally. No "origin" remote configured yet, so nothing was pushed.');
  process.exit(0);
}
console.log(`▶ Pushing ${branch} to origin (no force)…`);
if (!run('git', ['push', 'origin', branch])) {
  console.error('✖ Push failed (the remote may have newer commits). Run "git pull --rebase" and try again. Nothing was force-pushed.');
  process.exit(1);
}
console.log('✔ Pushed. Cloudflare Pages will now build and deploy this commit — check the Cloudflare dashboard for status.');
