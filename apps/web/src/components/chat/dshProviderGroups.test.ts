import { describe, expect, it } from "vite-plus/test";

import {
  caduceusProviderDisplayName,
  caduceusProviderOrder,
  isCaduceusProviderInstance,
  modelBelongsToDshProviderGroup,
} from "./dshProviderGroups";

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
  it("exposes exactly the five Caduceus provider groups in the intended order", () => {
    const instanceIds = [
      "opencode",
      "dsh-opencode-go",
      "claudeAgent",
      "antigravity",
      "dsh-local",
      "codex",
      "dsh-venice",
      "dsh",
    ];

    expect(
      instanceIds
        .filter(isCaduceusProviderInstance)
        .toSorted((left, right) => caduceusProviderOrder(left) - caduceusProviderOrder(right)),
    ).toEqual(["codex", "claudeAgent", "dsh-local", "dsh-venice", "dsh-opencode-go"]);
  });

  it("uses the five requested provider labels", () => {
    expect(
      ["codex", "claudeAgent", "dsh-local", "dsh-venice", "dsh-opencode-go"].map((instanceId) =>
        caduceusProviderDisplayName(instanceId, "Configured name"),
      ),
    ).toEqual(["Codex", "Claude", "DSH: Local models", "Venice", "OpenCode Go"]);
    expect(caduceusProviderDisplayName("other", "Configured name")).toBe("Configured name");
  });
});
