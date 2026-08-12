'use strict';

const { spawnSync } = require('node:child_process');

const nodeMajor = Number.parseInt(process.versions.node.split('.')[0] ?? '', 10);

if (nodeMajor !== 22) {
  console.error(
    `[runtime] Node.js 22.x is required for NOCScheduler. Current runtime: ${process.version}.`,
  );
  console.error('[runtime] Switch to Node.js 22 and rerun the gate.');
  process.exit(1);
}

console.log(`[runtime] Node.js OK: ${process.version}`);
console.log(`[runtime] npm is expected to satisfy the root package.json engine (>=10).`);

const java = spawnSync('java', ['-version'], { encoding: 'utf8' });
if (java.error) {
  console.warn(
    '[runtime] Java was not detected. This does not block WP-F00, but Java 21 is required before Firebase Firestore Emulator work.',
  );
} else {
  const combined = `${java.stderr ?? ''}
${java.stdout ?? ''}`.trim();
  console.log(`[runtime] Java detected: ${combined.split(/\r?\n/)[0] || 'unknown'}`);
}
