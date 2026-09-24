import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { test } from "node:test";
import { fileURLToPath } from "node:url";

const packageUrl = new URL("../packages/sdk/package.json", import.meta.url);
const { version } = JSON.parse(readFileSync(packageUrl, "utf8"));
const loader = createRequire(packageUrl).resolve("tsx");
const cli = fileURLToPath(new URL("../packages/sdk/src/bin/cli.ts", import.meta.url));

function runCli(args: string[]) {
  return spawnSync(process.execPath, ["--import", loader, cli, ...args], {
    cwd: tmpdir(),
    encoding: "utf8",
    timeout: 10_000,
  });
}

for (const flag of ["--version", "-v"]) {
  test(`${flag} prints the SDK version from another working directory`, () => {
    const result = runCli([flag]);
    assert.ifError(result.error);
    assert.equal(result.status, 0, result.stderr);
    assert.equal(result.stderr, "");
    assert.equal(result.stdout.trim(), `pressprotocol v${version}`);
  });
}

test("help documents both version flags", () => {
  const result = runCli(["--help"]);
  assert.ifError(result.error);
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /--version, -v\s+Show/);
});
