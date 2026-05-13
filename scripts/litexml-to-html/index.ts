#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const cliPath = fileURLToPath(
  new URL('../../packages/rich-compose/dist/litexml-to-html.mjs', import.meta.url),
);

if (!existsSync(cliPath)) {
  process.stderr.write(
    'litexml-to-html: missing packages/rich-compose/dist/litexml-to-html.mjs. Run `pnpm --filter @haklex/rich-compose build` first.\n',
  );
  process.exit(1);
}

const result = spawnSync(process.execPath, [cliPath, ...process.argv.slice(2)], {
  stdio: 'inherit',
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 0);
