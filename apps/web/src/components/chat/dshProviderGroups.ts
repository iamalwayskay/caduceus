const DSH_PROVIDER_BY_INSTANCE: Readonly<Record<string, ReadonlySet<string>>> = {
  "dsh-local": new Set(["llamacpp", "ollama"]),
  "dsh-venice": new Set(["venice"]),
  "dsh-opencode-go": new Set(["opencode-go"]),
};

const CADUCEUS_PROVIDER_GROUPS = [
  ["codex", "Codex"],
  ["claudeAgent", "Claude"],
  ["dsh-local", "DSH: Local models"],
  ["dsh-venice", "Venice"],
  ["dsh-opencode-go", "OpenCode Go"],
] as const;

const CADUCEUS_PROVIDER_ORDER: ReadonlyMap<string, number> = new Map(
  CADUCEUS_PROVIDER_GROUPS.map(([instanceId], index) => [instanceId, index] as const),
);
const CADUCEUS_PROVIDER_DISPLAY_NAME: ReadonlyMap<string, string> = new Map(
  CADUCEUS_PROVIDER_GROUPS,
);

export function isCaduceusProviderInstance(instanceId: string): boolean {
  return CADUCEUS_PROVIDER_ORDER.has(instanceId);
}

export function caduceusProviderDisplayName(instanceId: string, fallback: string): string {
  return CADUCEUS_PROVIDER_DISPLAY_NAME.get(instanceId) ?? fallback;
}

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
