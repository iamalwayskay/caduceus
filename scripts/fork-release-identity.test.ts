// @effect-diagnostics nodeBuiltinImport:off -- validates checked-in release scripts and workflows.
import * as NodeFS from "node:fs";
import * as NodePath from "node:path";

import { expect, it } from "vite-plus/test";

const root = NodePath.resolve(import.meta.dirname, "..");
const read = (path: string) => NodeFS.readFileSync(NodePath.join(root, path), "utf8");

it("ships Caduceus release defaults and workflow gates", () => {
  for (const path of [
    "packages/shared/src/cliRelease.ts",
    "scripts/npm-launcher/t3.mjs",
    "scripts/install.sh",
    "scripts/install.ps1",
  ]) {
    const source = read(path);
    expect(source, path).toContain("iamalwayskay/caduceus");
    expect(source, path).not.toContain("pingdotgg/t3code/releases");
  }

  expect(read(".github/workflows/release.yml")).toContain(
    "github.repository == 'iamalwayskay/caduceus'",
  );
  expect(read(".github/workflows/deploy-relay.yml")).toContain(
    "github.repository == 'iamalwayskay/caduceus' && github.ref == 'refs/heads/main'",
  );
});
