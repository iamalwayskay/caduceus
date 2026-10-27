import * as Context from "effect/Context";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";

import type { TelemetryOwner } from "./Identify.ts";

// Product analytics remain inert regardless of runtime configuration.
const noOpAnalytics = {
  record: Effect.fn("AnalyticsService.record")(function () {
    return Effect.void;
  }),
  flush: Effect.void,
  recordOwners: Effect.fn("AnalyticsService.recordOwners")(function () {
    return Effect.void;
  }),
};

export class AnalyticsService extends Context.Service<
  AnalyticsService,
  {
    readonly record: (
      event: string,
      properties?: Readonly<Record<string, unknown>>,
    ) => Effect.Effect<void>;

    readonly flush: Effect.Effect<void>;

    readonly recordOwners: (
      owners: ReadonlyArray<TelemetryOwner>,
      observedBy: "server" | "client",
    ) => Effect.Effect<void>;
  }
>()("t3/telemetry/AnalyticsService") {
  static readonly layerTest = Layer.succeed(AnalyticsService, noOpAnalytics);
}

/** @public */
export const make = Effect.succeed(AnalyticsService.of(noOpAnalytics));

export const layer = Layer.succeed(AnalyticsService, noOpAnalytics);
