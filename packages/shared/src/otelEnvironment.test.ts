import { assert, describe, it } from "@effect/vitest";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as OtlpResource from "effect/observability/OtlpResource";

import * as OtelEnvironment from "./otelEnvironment.ts";

const load = (env: Record<string, string>) =>
  OtelEnvironment.load.pipe(Effect.provide(ConfigProvider.layer(ConfigProvider.fromEnv({ env }))));

const hostileEnvironment: Record<string, string> = {
  T3CODE_OTEL_SDK_DISABLED: "false",
  OTEL_SDK_DISABLED: "false",
  T3CODE_OTLP_PROTOCOL: "http/json",
  T3CODE_OTLP_HEADERS: "authorization=secret",
  T3CODE_OTLP_EXPORT_INTERVAL_MS: "1",
  OTEL_EXPORTER_OTLP_ENDPOINT: "http://127.0.0.1:4318",
  OTEL_EXPORTER_OTLP_PROTOCOL: "http/json",
  OTEL_EXPORTER_OTLP_HEADERS: "authorization=secret",
  ...Object.fromEntries(
    ["TRACES", "METRICS", "LOGS"].flatMap((signal) => [
      [`T3CODE_OTLP_${signal}_URL`, `http://127.0.0.1:4318/t3/${signal}`],
      [`T3CODE_OTLP_${signal}_PROTOCOL`, "http/json"],
      [`T3CODE_OTLP_${signal}_HEADERS`, "authorization=secret"],
      [`OTEL_EXPORTER_OTLP_${signal}_ENDPOINT`, `http://127.0.0.1:4318/otel/${signal}`],
      [`OTEL_EXPORTER_OTLP_${signal}_PROTOCOL`, "http/protobuf"],
      [`OTEL_EXPORTER_OTLP_${signal}_HEADERS`, "authorization=secret"],
      [`OTEL_${signal}_EXPORTER`, "otlp"],
    ]),
  ),
};

describe("OtelEnvironment", () => {
  it.effect.each([
    { name: "no configuration", env: {} },
    { name: "every export input enabled", env: hostileEnvironment },
    {
      name: "application override of the standard kill switch",
      env: { ...hostileEnvironment, OTEL_SDK_DISABLED: "true" },
    },
    {
      name: "invalid export configuration",
      env: {
        ...hostileEnvironment,
        OTEL_EXPORTER_OTLP_ENDPOINT: "not-a-url?secret=hidden",
        OTEL_EXPORTER_OTLP_HEADERS: "authorization=%zz",
      },
    },
  ])("permanently disables export with $name", ({ env }) =>
    Effect.gen(function* () {
      const otel = yield* load(env);
      assert.isTrue(otel.disabled);
      for (const signal of ["traces", "metrics", "logs"] as const) {
        assert.deepStrictEqual(otel[signal], OtelEnvironment.OtelSignal.Off());
        assert.isUndefined(
          OtelEnvironment.resolveSignalEndpoint(
            otel,
            signal,
            {
              url: hostileEnvironment[`T3CODE_OTLP_${signal.toUpperCase()}_URL`],
              export: {
                protocol: "http/json",
                headers: { authorization: "secret" },
                exportIntervalMs: 1,
              },
            },
            {
              bootstrapUrl: `http://127.0.0.1:4318/bootstrap/${signal}`,
              settingsUrl: `http://127.0.0.1:4318/settings/${signal}`,
            },
          ),
        );
      }
    }),
  );

  it("does not resolve export endpoints even from an enabled environment object", () => {
    for (const signal of ["traces", "metrics", "logs"] as const) {
      const otel = {
        ...OtelEnvironment.none,
        disabled: false,
        [signal]: OtelEnvironment.OtelSignal.Export({
          url: "http://127.0.0.1:4318/otel",
          variable: "OTEL_EXPORTER_OTLP_ENDPOINT",
          protocol: "http/protobuf",
          headers: undefined,
        }),
      };
      assert.isUndefined(
        OtelEnvironment.resolveSignalEndpoint(
          otel,
          signal,
          {
            url: "http://127.0.0.1:4318/t3",
            export: { protocol: "http/json", headers: undefined, exportIntervalMs: 1 },
          },
          {
            bootstrapUrl: "http://127.0.0.1:4318/bootstrap",
            settingsUrl: "http://127.0.0.1:4318/settings",
          },
        ),
      );
    }
  });

  it("the fallback environment also disables every signal", () => {
    assert.isTrue(OtelEnvironment.none.disabled);
    assert.deepStrictEqual(OtelEnvironment.none.traces, OtelEnvironment.OtelSignal.Off());
    assert.deepStrictEqual(OtelEnvironment.none.metrics, OtelEnvironment.OtelSignal.Off());
    assert.deepStrictEqual(OtelEnvironment.none.logs, OtelEnvironment.OtelSignal.Off());
  });

  it.effect.each([
    {
      name: "a percent-encoded list",
      env: { OTEL_RESOURCE_ATTRIBUTES: "team=core,message=hello%20world" },
      resourceAttributes: { team: "core", message: "hello world" },
      warnings: [],
    },
    {
      name: "a list that does not decode",
      env: { OTEL_RESOURCE_ATTRIBUTES: "team=core,broken=%zz" },
      resourceAttributes: {},
      warnings: [
        "OTEL_RESOURCE_ATTRIBUTES is not a list of percent-encoded key=value pairs and was ignored",
      ],
    },
  ])("preserves local resource attributes: $name", ({ env, resourceAttributes, warnings }) =>
    Effect.gen(function* () {
      const otel = yield* load({ ...hostileEnvironment, ...env });
      assert.isTrue(otel.disabled);
      assert.deepStrictEqual(otel.resourceAttributes, resourceAttributes);
      assert.deepStrictEqual(otel.warnings, warnings);
    }),
  );

  describe("layerResourceAttributes", () => {
    it.effect.each([
      { name: "a list that does not decode", raw: "team=%zz", attributes: [] },
      { name: "encoded separators", raw: "a%2Cb=x%3Dy", attributes: ["a,b"] },
    ])("lets the exporters' own read succeed with $name", ({ raw, attributes }) =>
      Effect.gen(function* () {
        const layerEnv = ConfigProvider.layer(
          ConfigProvider.fromEnv({ env: { OTEL_RESOURCE_ATTRIBUTES: raw } }),
        );
        const otel = yield* OtelEnvironment.load.pipe(Effect.provide(layerEnv));
        const resource = yield* OtlpResource.fromConfig({ serviceName: "t3" }).pipe(
          Effect.provide(
            Layer.provide(
              OtelEnvironment.layerResourceAttributes(otel.resourceAttributes),
              layerEnv,
            ),
          ),
        );
        assert.deepStrictEqual(
          resource.attributes
            .map((attribute) => attribute.key)
            .filter((key) => !key.startsWith("telemetry.sdk.")),
          [...attributes, "service.name"],
        );
      }),
    );
  });
});
