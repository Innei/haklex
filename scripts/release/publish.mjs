#!/usr/bin/env node
import { execFileSync, spawnSync } from 'node:child_process';
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

function isPublished(name, version) {
  const result = spawnSync('npm', ['view', `${name}@${version}`, 'version'], {
    encoding: 'utf8',
  });
  return result.status === 0 && result.stdout.trim() === version;
}

function check(tag) {
  const version = sharedVersion(loadPackages());
  if (tag && tag !== `v${version}`) {
    throw new Error(`Tag ${tag} does not match the shared version v${version}`);
  }
  console.log(`Shared version ${version}`);
}

function publish() {
  const packages = loadPackages();
  const version = sharedVersion(packages);
  const packDir = mkdtempSync(path.join(tmpdir(), 'haklex-pack-'));
  try {
    for (const name of topoOrder(packages)) {
      if (isPublished(name, version)) {
        console.log(`skip ${name}@${version} (already on npm)`);
        continue;
      }
      const dest = mkdtempSync(path.join(packDir, 'pkg-'));
      // pnpm pack rewrites workspace: specifiers and applies publishConfig;
      // npm publish then handles the trusted-publishing OIDC exchange.
      execFileSync('pnpm', ['pack', '--pack-destination', dest], {
        cwd: packages.get(name).dir,
        stdio: ['ignore', 'ignore', 'inherit'],
      });
      const tarball = readdirSync(dest).find((file) => file.endsWith('.tgz'));
      if (!tarball) throw new Error(`pnpm pack produced no tarball for ${name}`);
      const result = spawnSync('npm', ['publish', path.join(dest, tarball), '--access', 'public'], {
        encoding: 'utf8',
      });
      process.stdout.write(result.stdout);
      process.stderr.write(result.stderr);
      if (result.status !== 0) {
        if (/cannot publish over|previously published/i.test(result.stderr)) {
          console.log(`skip ${name}@${version} (registry already has it)`);
          continue;
        }
        throw new Error(`npm publish failed for ${name}@${version}`);
      }
      console.log(`published ${name}@${version}`);
    }
  } finally {
    rmSync(packDir, { recursive: true, force: true });
  }
}

async function waitResolvable(timeoutMinutes = 60) {
  const packages = loadPackages();
  const version = sharedVersion(packages);
  const deadline = Date.now() + timeoutMinutes * 60_000;
  let missing = [...packages.keys()];
  while (missing.length > 0) {
    missing = missing.filter((name) => !isPublished(name, version));
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
    publish();
    break;
  }
  case 'wait': {
    await waitResolvable(arg ? Number(arg) : undefined);
    break;
  }
  default: {
    console.error('usage: publish.mjs <check [tag] | list | publish | wait [minutes]>');
    process.exit(1);
  }
}
