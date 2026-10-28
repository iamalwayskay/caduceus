const DSH_PROVIDER_BY_INSTANCE: Readonly<Record<string, ReadonlySet<string>>> = {
  "dsh-local": new Set(["llamacpp", "ollama"]),
  "dsh-venice": new Set(["venice"]),
  "dsh-opencode-go": new Set(["opencode-go"]),
};

const CADUCEUS_PROVIDER_ORDER = new Map(
  ["codex", "claudeAgent", "dsh-local", "dsh-venice", "dsh-opencode-go"].map(
    (instanceId, index) => [instanceId, index] as const,
  ),
);

export function caduceusProviderOrder(instanceId: string): number {
  return CADUCEUS_PROVIDER_ORDER.get(instanceId) ?? Number.MAX_SAFE_INTEGER;
}

export function modelBelongsToDshProviderGroup(instanceId: string, slug: string): boolean {
  const allowedProviders = DSH_PROVIDER_BY_INSTANCE[instanceId];
  if (!allowedProviders) return true;

  try {
    const selection: unknown = JSON.parse(slug);
    return (
      Array.isArray(selection) &&
      typeof selection[0] === "string" &&
      allowedProviders.has(selection[0])
    );
  } catch {
    return false;
  }
}
