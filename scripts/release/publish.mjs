#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const packagesDir = path.join(repoRoot, 'packages');

function loadPackages() {
  const packages = new Map();
  for (const dir of readdirSync(packagesDir)) {
    const manifestPath = path.join(packagesDir, dir, 'package.json');
    if (!existsSync(manifestPath)) continue;
    const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'));
    if (manifest.private) continue;
    packages.set(manifest.name, { dir: path.join(packagesDir, dir), manifest });
  }
  return packages;
}

function topoOrder(packages) {
  const order = [];
  const done = new Set();
  const visiting = new Set();
  const visit = (name) => {
    if (done.has(name)) return;
    if (visiting.has(name)) throw new Error(`Dependency cycle at ${name}`);
    visiting.add(name);
    const { manifest } = packages.get(name);
    const deps = {
      ...manifest.dependencies,
      ...manifest.optionalDependencies,
      ...manifest.peerDependencies,
    };
    for (const dep of Object.keys(deps)) if (packages.has(dep)) visit(dep);
    visiting.delete(name);
    done.add(name);
    order.push(name);
  };
  for (const name of [...packages.keys()].sort()) visit(name);
  return order;
}

function sharedVersion(packages) {
  const expected = JSON.parse(
    readFileSync(path.join(packagesDir, 'rich-editor/package.json'), 'utf8'),
  ).version;
  const drift = [...packages.values()]
    .filter(({ manifest }) => manifest.version !== expected)
    .map(({ manifest }) => `${manifest.name}@${manifest.version}`);
  if (drift.length > 0) {
    throw new Error(`Packages off the shared version ${expected}: ${drift.join(', ')}`);
  }
  return expected;
}

function run(command, args, options = {}) {
  return new Promise((resolve) => {
    const child = spawn(command, args, { ...options, stdio: ['ignore', 'pipe', 'pipe'] });
    let stdout = '';
    let stderr = '';
    child.stdout.on('data', (chunk) => (stdout += chunk));
    child.stderr.on('data', (chunk) => (stderr += chunk));
    child.on('close', (status) => resolve({ status, stdout, stderr }));
  });
}

async function pool(items, concurrency, worker) {
  const queue = [...items];
  const runners = Array.from({ length: Math.min(concurrency, queue.length) }, async () => {
    while (queue.length > 0) await worker(queue.shift());
  });
  await Promise.all(runners);
}

async function isPublished(name, version) {
  const result = await run('npm', ['view', `${name}@${version}`, 'version']);
  return result.status === 0 && result.stdout.trim() === version;
}

function check(tag) {
  const version = sharedVersion(loadPackages());
  if (tag && tag !== `v${version}`) {
    throw new Error(`Tag ${tag} does not match the shared version v${version}`);
  }
  console.log(`Shared version ${version}`);
}

async function publishOne(name, dir, version, packDir) {
  if (await isPublished(name, version)) return `skip ${name}@${version} (already on npm)`;
  const dest = mkdtempSync(path.join(packDir, 'pkg-'));
  // pnpm pack rewrites workspace: specifiers and applies publishConfig;
  // npm publish then handles the trusted-publishing OIDC exchange.
  const pack = await run('pnpm', ['pack', '--pack-destination', dest], { cwd: dir });
  const tarball = readdirSync(dest).find((file) => file.endsWith('.tgz'));
  if (pack.status !== 0 || !tarball) {
    throw new Error(`pnpm pack failed for ${name}\n${pack.stderr}`);
  }
  const result = await run('npm', ['publish', path.join(dest, tarball), '--access', 'public']);
  if (result.status === 0) return `published ${name}@${version}`;
  if (/cannot publish over|previously published/i.test(result.stderr)) {
    return `skip ${name}@${version} (registry already has it)`;
  }
  throw new Error(`npm publish failed for ${name}@${version}\n${result.stderr}`);
}

async function publish(concurrency = 8) {
  const packages = loadPackages();
  const version = sharedVersion(packages);
  const packDir = mkdtempSync(path.join(tmpdir(), 'haklex-pack-'));
  const failures = [];
  try {
    await pool(topoOrder(packages), concurrency, async (name) => {
      try {
        console.log(await publishOne(name, packages.get(name).dir, version, packDir));
      } catch (error) {
        failures.push(name);
        console.error(error.message);
      }
    });
  } finally {
    rmSync(packDir, { recursive: true, force: true });
  }
  if (failures.length > 0) {
    throw new Error(`Failed to publish ${failures.length}: ${failures.join(', ')}`);
  }
}

async function waitResolvable(timeoutMinutes = 60) {
  const packages = loadPackages();
  const version = sharedVersion(packages);
  const deadline = Date.now() + timeoutMinutes * 60_000;
  let missing = [...packages.keys()];
  while (missing.length > 0) {
    const resolved = new Set();
    await pool(missing, 16, async (name) => {
      if (await isPublished(name, version)) resolved.add(name);
    });
    missing = missing.filter((name) => !resolved.has(name));
    if (missing.length === 0) break;
    if (Date.now() > deadline) {
      throw new Error(`Still unresolvable after ${timeoutMinutes} min: ${missing.join(', ')}`);
    }
    console.log(`${new Date().toISOString()} waiting on ${missing.length}: ${missing.join(', ')}`);
    await new Promise((resolve) => setTimeout(resolve, 20_000));
  }
  console.log(`All ${packages.size} packages resolve at ${version}`);
}

const [command, arg] = process.argv.slice(2);
switch (command) {
  case 'check': {
    check(arg);
    break;
  }
  case 'list': {
    console.log(topoOrder(loadPackages()).join('\n'));
    break;
  }
  case 'publish': {
    await publish(arg ? Number(arg) : undefined);
    break;
  }
  case 'wait': {
    await waitResolvable(arg ? Number(arg) : undefined);
    break;
  }
  default: {
    console.error(
      'usage: publish.mjs <check [tag] | list | publish [concurrency] | wait [minutes]>',
    );
    process.exit(1);
  }
}
