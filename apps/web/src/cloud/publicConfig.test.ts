import { afterEach, describe, expect, it, vi } from "vite-plus/test";

import {
  hasCloudPublicConfig,
  resolveCloudPublicConfig,
  resolveRelayClerkTokenOptions,
} from "./publicConfig.ts";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe("hosted Connect configuration", () => {
  it.each([
    ["browser", { location: new URL("https://app.example.test") }],
    ["electron", { location: new URL("file:///app/index.html"), desktopBridge: {} }],
  ])("stays disabled in %s even when every legacy environment value is present", (_, window) => {
    vi.stubEnv("VITE_CLERK_PUBLISHABLE_KEY", `pk_live_${btoa("clerk.example.test$")}`);
    vi.stubEnv("VITE_CLERK_JWT_TEMPLATE", "t3-relay");
    vi.stubEnv("VITE_T3CODE_RELAY_URL", "https://relay.example.test");
    vi.stubGlobal("window", window);

    expect(resolveCloudPublicConfig()).toEqual({
      clerkPublishableKey: null,
      clerkJwtTemplate: null,
      relayUrl: null,
    });
    expect(hasCloudPublicConfig()).toBe(false);
    expect(() => resolveRelayClerkTokenOptions()).toThrowError(
      "T3CODE_CLERK_JWT_TEMPLATE is not configured.",
    );
  });
});
