import { describe, expect, it } from "vite-plus/test";

import { caduceusProviderOrder, modelBelongsToDshProviderGroup } from "./dshProviderGroups";

describe("modelBelongsToDshProviderGroup", () => {
  it("keeps local runtimes in the DSH local group", () => {
    expect(modelBelongsToDshProviderGroup("dsh-local", '["llamacpp","qwen3.8"]')).toBe(true);
    expect(modelBelongsToDshProviderGroup("dsh-local", '["ollama","decider-2b"]')).toBe(true);
    expect(modelBelongsToDshProviderGroup("dsh-local", '["venice","default"]')).toBe(false);
  });

  it("separates Venice and OpenCode Go catalogs", () => {
    expect(modelBelongsToDshProviderGroup("dsh-venice", '["venice","default"]')).toBe(true);
    expect(modelBelongsToDshProviderGroup("dsh-opencode-go", '["opencode-go","gpt-5.4"]')).toBe(
      true,
    );
    expect(modelBelongsToDshProviderGroup("dsh-venice", '["opencode-go","gpt-5.4"]')).toBe(false);
  });

  it("leaves unrelated providers unchanged and rejects malformed DSH entries", () => {
    expect(modelBelongsToDshProviderGroup("codex", "gpt-5.4")).toBe(true);
    expect(modelBelongsToDshProviderGroup("dsh-local", "not-json")).toBe(false);
  });
});

describe("caduceusProviderOrder", () => {
  it("places Venice before OpenCode Go", () => {
    expect(caduceusProviderOrder("dsh-venice")).toBeLessThan(
      caduceusProviderOrder("dsh-opencode-go"),
    );
  });
});
