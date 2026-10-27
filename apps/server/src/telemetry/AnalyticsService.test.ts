import * as NodeServices from "@effect/platform-node/NodeServices";
import * as HostProcess from "@t3tools/shared/HostProcess";
import { assert, it } from "@effect/vitest";
import * as ConfigProvider from "effect/ConfigProvider";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as HttpClient from "effect/http/HttpClient";
import * as HttpClientResponse from "effect/http/HttpClientResponse";

import * as ServerConfig from "../config.ts";
import * as AnalyticsService from "./AnalyticsService.ts";

it.effect("never sends analytics when environment variables explicitly enable it", () =>
  Effect.gen(function* () {
    const requests: Array<string> = [];
    const client = HttpClient.make((request) => {
      requests.push(request.url);
      return Effect.succeed(
        HttpClientResponse.fromWeb(request, new Response(null, { status: 204 })),
      );
    });
    const runtime = AnalyticsService.layer.pipe(
      Layer.provideMerge(
        ServerConfig.ServerConfig.layerTest(process.cwd(), {
          prefix: "caduceus-analytics-disabled-",
        }),
      ),
      Layer.provide(
        ConfigProvider.layer(
          ConfigProvider.fromEnvRecord({
            T3CODE_TELEMETRY_ENABLED: "true",
            T3CODE_POSTHOG_KEY: "hostile-key",
            T3CODE_POSTHOG_HOST: "http://127.0.0.1:4318",
            T3CODE_TELEMETRY_FLUSH_BATCH_SIZE: "1",
          }),
        ),
      ),
      Layer.provide(
        Layer.mergeAll(
          Layer.succeed(HttpClient.HttpClient, client),
          Layer.succeed(HostProcess.Platform, "linux"),
          Layer.succeed(HostProcess.Architecture, "x64"),
        ),
      ),
    );

    yield* Effect.gen(function* () {
      const analytics = yield* AnalyticsService.AnalyticsService;
      yield* analytics.record("server.started", { secret: "must-stay-local" });
      yield* analytics.recordOwners([{ source: "device", ownerId: "device-owner" }], "client");
      yield* analytics.recordOwners([{ source: "connect", ownerId: "connect-owner" }], "server");
      yield* analytics.flush;
    }).pipe(Effect.provide(runtime));

    assert.deepStrictEqual(requests, []);
  }).pipe(Effect.provide(NodeServices.layer)),
);

it.effect("production construction and calls need no identity, filesystem, or HTTP services", () =>
  Effect.gen(function* () {
    const analytics = yield* AnalyticsService.make;
    yield* analytics.record("server.started");
    yield* analytics.recordOwners([{ source: "device", ownerId: "owner" }], "server");
    yield* analytics.flush;
  }),
);
