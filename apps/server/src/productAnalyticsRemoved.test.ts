// @effect-diagnostics nodeBuiltinImport:off -- source invariant scans the checked-in server tree.
import * as NodeFS from "node:fs";
import * as NodePath from "node:path";

import { expect, it } from "vite-plus/test";

const sourceRoot = import.meta.dirname;

function productionSources(directory: string): ReadonlyArray<string> {
  return NodeFS.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = NodePath.join(directory, entry.name);
    if (entry.isDirectory()) return productionSources(path);
    return entry.isFile() && entry.name.endsWith(".ts") && !entry.name.includes(".test.")
      ? [path]
      : [];
  });
}

it("contains no product analytics subsystem or call sites", () => {
  const forbidden = [
    "AnalyticsService",
    "DelegatedTaskAnalytics",
    "ProviderDimensions",
    "FeatureUsage",
    "ingest.t3.codes",
  ];
  const matches = productionSources(sourceRoot).flatMap((path) => {
    const source = NodeFS.readFileSync(path, "utf8");
    return forbidden
      .filter((needle) => source.includes(needle))
      .map((needle) => `${NodePath.relative(sourceRoot, path)}: ${needle}`);
  });

  expect(matches).toEqual([]);
});
