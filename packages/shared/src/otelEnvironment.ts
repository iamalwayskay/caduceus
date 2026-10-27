import * as Config from "effect/Config";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Data from "effect/Data";
import * as Effect from "effect/Effect";
import * as Schema from "effect/Schema";

import type { OtlpEndpointSource } from "@t3tools/contracts";

import type { OtlpProtocol, SignalExport } from "./observability.ts";

export type OtelSignal = Data.TaggedEnum<{
  Unset: {};
  Off: {};
  Export: {
    readonly url: string;
    readonly variable: string;
    readonly protocol: OtlpProtocol;
    readonly headers: Readonly<Record<string, string>> | undefined;
  };
}>;
export const OtelSignal = Data.taggedEnum<OtelSignal>();

export interface OtelEnvironment {
  readonly disabled: boolean;
  readonly warnings: ReadonlyArray<string>;
  readonly resourceAttributes: Readonly<Record<string, string>>;
  readonly traces: OtelSignal;
  readonly metrics: OtelSignal;
  readonly logs: OtelSignal;
}

const RESOURCE_ATTRIBUTES = "OTEL_RESOURCE_ATTRIBUTES";

interface ResourceAttributes {
  readonly value: Readonly<Record<string, string>>;
  readonly warning?: string;
}

const resourceAttributes = Config.Record(
  Schema.StringFromUriComponent,
  Schema.StringFromUriComponent,
  RESOURCE_ATTRIBUTES,
).pipe(
  Config.map((value): ResourceAttributes => ({ value })),
  Config.orElse(() =>
    Config.String(RESOURCE_ATTRIBUTES).pipe(
      // The value is left out because attributes can carry credentials.
      Config.map((): ResourceAttributes => ({
        value: {},
        warning: `${RESOURCE_ATTRIBUTES} is not a list of percent-encoded key=value pairs and was ignored`,
      })),
    ),
  ),
  Config.withDefault<ResourceAttributes>({ value: {} }),
);

// Export policy is fixed for this fork; only local resource attributes are configurable.
export const load: Effect.Effect<OtelEnvironment> = resourceAttributes.pipe(
  Effect.map((resource) => ({
    ...none,
    resourceAttributes: resource.value,
    warnings: resource.warning === undefined ? [] : [resource.warning],
  })),
  Effect.orDie,
);

export const isRelayTracingEnabled = (_env: Readonly<Record<string, string | undefined>>) => false;

export type SignalName = "traces" | "metrics" | "logs";

export interface SignalEndpoint {
  readonly url: string;
  readonly export: SignalExport;
  readonly source: OtlpEndpointSource;
  /** The environment variable that set the endpoint, when `source` is `environment`. */
  readonly variable?: string;
}

export const resolveSignalEndpoint = (
  _otel: OtelEnvironment,
  _signal: SignalName,
  _t3: { readonly url: string | undefined; readonly export: SignalExport },
  _fallback: {
    readonly bootstrapUrl: string | undefined;
    readonly settingsUrl: string | undefined;
  },
): SignalEndpoint | undefined => undefined;

/** Give OTLP exporters the accepted resource attributes so their own decoding cannot fail. */
export const layerResourceAttributes = (attributes: Readonly<Record<string, string>>) =>
  ConfigProvider.layerAdd(
    ConfigProvider.fromEnv({
      env: {
        [RESOURCE_ATTRIBUTES]: Object.entries(attributes)
          .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
          .join(","),
      },
      preserveEmptyStrings: true,
    }),
    { asPrimary: true },
  );

export const none: OtelEnvironment = {
  disabled: true,
  warnings: [],
  resourceAttributes: {},
  traces: OtelSignal.Off(),
  metrics: OtelSignal.Off(),
  logs: OtelSignal.Off(),
};
