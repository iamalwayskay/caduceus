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
    "apps/desktop/src/app/DesktopStartupRecovery.ts",
    "apps/web/src/components/desktopUpdate.logic.ts",
  ]) {
    const source = read(path);
    expect(source, path).toContain("iamalwayskay/caduceus");
    expect(source, path).not.toContain("pingdotgg/t3code/releases");
  }

  const releaseWorkflow = read(".github/workflows/release.yml");
  expect(releaseWorkflow).toContain("github.repository == 'iamalwayskay/caduceus'");
  expect(releaseWorkflow).toContain("https://github.com/iamalwayskay/caduceus/releases/latest");
  expect(releaseWorkflow).not.toContain("Publish CLI to npm");
  expect(releaseWorkflow).not.toContain("cli.ts publish");
  expect(releaseWorkflow).not.toContain("https://app.t3.codes");
  expect(releaseWorkflow).not.toContain("latest.app.t3.codes");
  expect(releaseWorkflow).not.toContain("nightly.app.t3.codes");
  expect(releaseWorkflow).not.toContain("projects/t3code-marketing");
  expect(releaseWorkflow).toContain("name: Download all CLI archives");
  expect(releaseWorkflow).toContain("name: Resolve T3 Connect public config");
  expect(releaseWorkflow).toContain("vars.CADUCEUS_DEPLOY_WEB == 'true'");
  expect(releaseWorkflow).toContain("vars.CADUCEUS_DEPLOY_MARKETING == 'true'");
  expect(read(".github/workflows/deploy-relay.yml")).toContain(
    "github.repository == 'iamalwayskay/caduceus' && github.ref == 'refs/heads/main'",
  );
});
