// @effect-diagnostics nodeBuiltinImport:off -- source invariant scans checked-in repository files.
import * as NodeFS from "node:fs";
import * as NodePath from "node:path";

import { expect, it } from "vite-plus/test";

const repositoryRoot = NodePath.resolve(import.meta.dirname, "../../..");

const scanTargets = [
  ".env.example",
  ".github/scripts",
  ".github/workflows",
  "apps/desktop/package.json",
  "apps/desktop/scripts",
  "apps/desktop/src",
  "apps/marketing/astro.config.mjs",
  "apps/marketing/package.json",
  "apps/marketing/public",
  "apps/marketing/scripts",
  "apps/marketing/src",
  "apps/marketing/vercel.ts",
  "apps/marketing/vite.config.ts",
  "apps/mobile/app.config.ts",
  "apps/mobile/index.ts",
  "apps/mobile/package.json",
  "apps/mobile/scripts",
  "apps/mobile/src",
  "apps/server/package.json",
  "apps/server/src",
  "apps/server/vite.config.ts",
  "apps/web/package.json",
  "apps/web/src",
  "apps/web/vite.config.ts",
  "infra/relay/alchemy.run.ts",
  "infra/relay/package.json",
  "infra/relay/src",
  "infra/task-cache/alchemy.run.ts",
  "infra/task-cache/package.json",
  "infra/task-cache/scripts",
  "infra/task-cache/src",
  "package.json",
  "packages/client-runtime/package.json",
  "packages/client-runtime/src",
  "packages/contracts/package.json",
  "packages/contracts/src",
  "packages/shared/package.json",
  "packages/shared/src",
  "pnpm-workspace.yaml",
  "scripts",
] as const;

const excludedDirectoryNames = new Set([
  "__fixtures__",
  "__generated__",
  "deps",
  "dist",
  "fixtures",
  "node_modules",
  "schema",
  "test",
  "testkit",
  "tests",
]);

const scannedExtensions = new Set([
  ".astro",
  ".cjs",
  ".cts",
  ".js",
  ".json",
  ".jsx",
  ".mjs",
  ".mts",
  ".ps1",
  ".sh",
  ".ts",
  ".tsx",
  ".yaml",
  ".yml",
]);

interface ForbiddenPattern {
  readonly label: string;
  readonly pattern: RegExp;
}

// These are network publishers, endpoint/configuration seams, and analytics-only identities.
// Local resource diagnostics, provider usage accounting, and ordinary Connect/auth fields are
// deliberately absent from this list.
const forbiddenPatterns: ReadonlyArray<ForbiddenPattern> = [
  { label: "product analytics service", pattern: /\bAnalyticsService\b/ },
  { label: "delegated-task analytics", pattern: /\bDelegatedTaskAnalytics\b/ },
  { label: "provider analytics dimensions", pattern: /\bProviderDimensions\b/ },
  { label: "feature-usage analytics", pattern: /\bFeatureUsage\b/ },
  { label: "hosted analytics endpoint", pattern: /ingest\.t3\.codes/ },
  { label: "product telemetry environment", pattern: /T3CODE_TELEMETRY_(?:ENABLED|CHANNEL)/ },
  { label: "Axiom dependency or endpoint", pattern: /(?:@alchemy\.run\/axiom|api\.axiom\.co)/ },
  { label: "Axiom ingest header", pattern: /X-Axiom-Dataset/i },
  {
    label: "Expo crash reporter",
    pattern: /(?:expo-observe|\bObserve\.(?:reportError|dispatchEvents)\b)/,
  },
  { label: "mobile crash-report preference", pattern: /\bcrashReportsEnabled\b/ },
  { label: "mobile telemetry ingest route", pattern: /\/v1\/mobile\/observe/ },
  { label: "mobile telemetry collector", pattern: /\bmobileTelemetry\b/ },
  { label: "mobile telemetry endpoint configuration", pattern: /\bobserveEndpointUrl\b/ },
  { label: "browser telemetry proxy route", pattern: /\/api\/observability\/v1\/traces/ },
  { label: "telemetry export settings", pattern: /\bTelemetryExportSettings\b/ },
  { label: "telemetry endpoint probe", pattern: /\bOtlpEndpointCheck\b/ },
  { label: "OTLP exporter", pattern: /\bOtlpExporter\b/ },
  { label: "OTLP logger exporter", pattern: /\bOtlpLogger\b/ },
  { label: "OTLP tracer exporter", pattern: /\bOtlpTracer\.make\b/ },
  { label: "OTLP metrics exporter", pattern: /\bOtlpMetrics\.layer\b/ },
  { label: "T3 OTLP environment", pattern: /T3CODE_OTLP_[A-Z0-9_]+/ },
  { label: "standard OTLP exporter environment", pattern: /OTEL_EXPORTER_OTLP_[A-Z0-9_]+/ },
  {
    label: "relay OTLP environment",
    pattern: /(?:VITE_RELAY_OTLP|T3CODE_RELAY_CLIENT_OTLP)_[A-Z0-9_]+/,
  },
  { label: "mobile OTLP environment", pattern: /EXPO_PUBLIC_OTLP_[A-Z0-9_]+/ },
  { label: "OTLP destination setting", pattern: /\botlp(?:Traces|Metrics|Logs)Url\b/ },
  { label: "browser remote tracing", pattern: /\b(?:clientTracing|startClientTracing)\b/ },
  { label: "relay remote tracing", pattern: /\b(?:relayTracing|withRelayClientTracing)\b/ },
  { label: "analytics owner identity", pattern: /\bclientOwner\b/ },
  { label: "analytics device identity", pattern: /\bclientDevice\b/ },
  { label: "analytics device capability", pattern: /\bAnalyticsDevice\b/ },
  {
    label: "anonymous analytics identity",
    pattern: /(?:anonymous-id|\banonymousId\b|\btelemetryId\b)/,
  },
  { label: "task timing header", pattern: /x-t3-build-ms/i },
  {
    label: "task telemetry sender",
    pattern: /\b(?:reportTelemetry|flushTelemetry|observeSummaries)\b/,
  },
  {
    label: "task telemetry protocol",
    pattern: /(?:remote\.telemetry|projects\/t3code\/telemetry)/,
  },
  { label: "task telemetry switch", pattern: /T3_TASK_CACHE_TELEMETRY/ },
  { label: "mobile source-map telemetry", pattern: /T3CODE_MOBILE_(?:OTLP|SOURCEMAP)_[A-Z0-9_]+/ },
];

function isScannedFile(path: string): boolean {
  const name = NodePath.basename(path);
  if (
    name.includes(".test.") ||
    name.includes(".testkit.") ||
    name.includes(".spec.") ||
    name.endsWith(".snap")
  )
    return false;
  if (name === ".env.example") return true;
  return scannedExtensions.has(NodePath.extname(name));
}

function collectFiles(path: string): ReadonlyArray<string> {
  const stat = NodeFS.statSync(path);
  if (stat.isFile()) return isScannedFile(path) ? [path] : [];
  return NodeFS.readdirSync(path, { withFileTypes: true })
    .sort((left, right) => left.name.localeCompare(right.name))
    .flatMap((entry) => {
      if (entry.isDirectory() && excludedDirectoryNames.has(entry.name)) return [];
      const child = NodePath.join(path, entry.name);
      if (entry.isDirectory()) return collectFiles(child);
      return entry.isFile() && isScannedFile(child) ? [child] : [];
    });
}

function lineMatch(
  path: string,
  line: string,
  lineNumber: number,
  forbidden: ForbiddenPattern,
): string | undefined {
  forbidden.pattern.lastIndex = 0;
  const match = forbidden.pattern.exec(line);
  if (!match) return undefined;
  const relative = NodePath.relative(repositoryRoot, path).split(NodePath.sep).join("/");
  return `${relative}:${lineNumber}:${(match.index ?? 0) + 1} [${forbidden.label}] ${JSON.stringify(match[0])}`;
}

it("contains no outbound telemetry publishers, configuration, routes, or identities", () => {
  const files = scanTargets
    .flatMap((target) => collectFiles(NodePath.join(repositoryRoot, target)))
    .sort((left, right) => left.localeCompare(right));

  const relativeFiles = new Set(files.map((path) => NodePath.relative(repositoryRoot, path)));
  for (const required of [
    ".github/workflows/release.yml",
    "apps/desktop/src/app/DesktopObservability.ts",
    "apps/marketing/astro.config.mjs",
    "apps/marketing/public/install.ps1",
    "apps/marketing/public/install.sh",
    "apps/marketing/src/pages/index.astro",
    "apps/marketing/package.json",
    "apps/mobile/app.config.ts",
    "apps/mobile/index.ts",
    "apps/server/src/server.ts",
    "apps/web/src/routes/__root.tsx",
    "infra/relay/src/worker.ts",
    "infra/task-cache/src/Cache.ts",
    "packages/client-runtime/src/authorization/remote.ts",
    "packages/shared/src/observability.ts",
    "scripts/mobile-native-client.ts",
  ]) {
    expect(relativeFiles.has(required), `source invariant did not scan ${required}`).toBe(true);
  }

  const marketingPackage = JSON.parse(
    NodeFS.readFileSync(NodePath.join(repositoryRoot, "apps/marketing/package.json"), "utf8"),
  ) as { readonly scripts?: Readonly<Record<string, string>> };
  for (const script of ["dev", "build", "preview"] as const) {
    expect(
      marketingPackage.scripts?.[script],
      `marketing ${script} must disable Astro telemetry`,
    ).toMatch(/(?:^|&& )cross-env ASTRO_TELEMETRY_DISABLED=1(?: |$)/u);
  }

  const matches = files.flatMap((path) =>
    NodeFS.readFileSync(path, "utf8")
      .split(/\r?\n/u)
      .flatMap((line, index) =>
        forbiddenPatterns.flatMap((forbidden) => {
          const match = lineMatch(path, line, index + 1, forbidden);
          return match === undefined ? [] : [match];
        }),
      ),
  );

  expect(matches, matches.join("\n")).toEqual([]);
});
