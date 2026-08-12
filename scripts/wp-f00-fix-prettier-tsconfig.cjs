const fs = require("node:fs");
const path = require("node:path");
const { execFileSync } = require("node:child_process");

const EXPECTED_BASE = "4f07706a2224d9990d94027e7235a9703283970e";
const SCRIPT_RELATIVE = "scripts/wp-f00-fix-prettier-tsconfig.cjs";

function fail(message) {
  console.error(`[WP-F00 repair] ${message}`);
  process.exit(1);
}

function runGit(args) {
  try {
    return execFileSync("git", args, {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();
  } catch (error) {
    const stderr = error && error.stderr ? String(error.stderr).trim() : "";
    fail(`Git command failed: git ${args.join(" ")}${stderr ? `\n${stderr}` : ""}`);
  }
}

const root = process.cwd();

if (!fs.existsSync(path.join(root, ".git"))) {
  fail("Run this generator from the NOCSchedulerJava repository root.");
}

const head = runGit(["rev-parse", "HEAD"]);
if (head !== EXPECTED_BASE) {
  fail(
    `Stale base. Expected HEAD ${EXPECTED_BASE}, got ${head}. ` +
      "Do not force-apply this repair; ask for a regenerated script."
  );
}

const dirtyLines = runGit(["status", "--porcelain"])
  .split(/\r?\n/)
  .filter(Boolean)
  .filter((line) => {
    const normalized = line.slice(3).replaceAll("\\", "/").replace(/^"|"$/g, "");
    return normalized !== SCRIPT_RELATIVE;
  });

if (dirtyLines.length > 0) {
  fail(
    "Repository has unrelated local changes. Commit/stash them first:\n" +
      dirtyLines.join("\n")
  );
}

const tsconfigPath = path.join(root, "tsconfig.json");
const expectedBefore = `{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  },
  "include": [
    "tooling/**/*.ts"
  ]
}
`;

const expectedAfter = `{
  "extends": "./tsconfig.base.json",
  "compilerOptions": {
    "module": "NodeNext",
    "moduleResolution": "NodeNext"
  },
  "include": ["tooling/**/*.ts"]
}
`;

if (!fs.existsSync(tsconfigPath)) {
  fail("tsconfig.json is missing.");
}

const currentTsconfig = fs.readFileSync(tsconfigPath, "utf8");
if (currentTsconfig === expectedAfter) {
  fail("tsconfig.json is already formatted; repair appears to have been applied.");
}
if (currentTsconfig !== expectedBefore) {
  fail(
    "tsconfig.json differs from the exact pushed failing state. " +
      "Aborting instead of overwriting an unknown local change."
  );
}

fs.writeFileSync(tsconfigPath, expectedAfter, "utf8");

const ledgerPath = path.join(root, "docs", "workflow", "PHASE_CONTROL.md");
if (!fs.existsSync(ledgerPath)) {
  fail("PHASE_CONTROL.md is missing.");
}

let ledger = fs.readFileSync(ledgerPath, "utf8");

const replacements = [
  [
    "| Last Implementation Commit | Pending — resolve latest pushed `main` commit on next assistant audit |",
    "| Last Implementation Commit | `4f07706a2224d9990d94027e7235a9703283970e` — QA failed at `format:check`; repair commit pending |",
  ],
  [
    "| Active Generator | `scripts/wp-f00-bootstrap-toolchain.cjs` |",
    "| Active Generator | `scripts/wp-f00-fix-prettier-tsconfig.cjs` |",
  ],
  [
    "| User Validation Pending | Yes — local quality gates must run after push |",
    "| User Validation Pending | Yes — formatter repair must be pushed, then full WP-F00 gates rerun |",
  ],
  [
    "| WP-F00 | Repository & Toolchain Bootstrap | PUSHED_UNVERIFIED | Generated toolchain state is pushed before QA |",
    "| WP-F00 | Repository & Toolchain Bootstrap | PUSHED_UNVERIFIED | Formatter repair prepared after `format:check` failure |",
  ],
];

for (const [before, after] of replacements) {
  if (!ledger.includes(before)) {
    fail(`PHASE_CONTROL.md no longer contains expected text:\n${before}`);
  }
  ledger = ledger.replace(before, after);
}

fs.writeFileSync(ledgerPath, ledger, "utf8");

console.log("WP-F00 formatter repair written successfully.");
console.log("- tsconfig.json formatted to Prettier canonical output");
console.log("- PHASE_CONTROL.md updated with failing base commit and repair state");
console.log("Next: cleanup generator, commit, push, then rerun WP-F00 QA.");
