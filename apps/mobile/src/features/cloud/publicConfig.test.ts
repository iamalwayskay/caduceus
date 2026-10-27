import { describe, expect, it, vi } from "vite-plus/test";

import { resolveCloudPublicConfig } from "./publicConfig";

vi.mock("expo-constants", () => ({
  default: {
    expoConfig: {
      extra: {
        observability: {
          tracesUrl: "https://api.axiom.test/v1/traces",
          tracesDataset: "mobile-traces",
          tracesToken: "public-ingest-token",
        },
      },
    },
  },
}));

describe("resolveCloudPublicConfig", () => {
  it("rejects an insecure relay URL", () => {
    expect(
      resolveCloudPublicConfig({
        clerk: { publishableKey: "pk_test_example", jwtTemplate: "t3-relay" },
        relay: { url: "http://relay.example.test" },
      }),
    ).toEqual({
      clerk: {
        publishableKey: "pk_test_example",
        jwtTemplate: "t3-relay",
      },
      relay: {
        url: null,
      },
    });
  });

  it("ignores legacy telemetry values from the Expo manifest", () => {
    expect(resolveCloudPublicConfig()).toEqual({
      clerk: {
        publishableKey: null,
        jwtTemplate: null,
      },
      relay: {
        url: null,
      },
    });
  });
});
