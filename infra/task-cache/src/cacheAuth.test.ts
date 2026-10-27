import { generateKeyPair, SignJWT } from "jose";
import { expect, it, vi } from "vite-plus/test";
import { authorizeCacheWrite } from "./cacheAuth.ts";
import { ISSUER } from "../vendor/vite-plus-remote-cache-cloudflare/src/auth.ts";

it("accepts cache writes only for the configured repository policy and audience", async () => {
  vi.useFakeTimers({ toFake: ["Date"] });
  vi.setSystemTime(1_000_000);
  try {
    const { publicKey, privateKey } = await generateKeyPair("RS256");
    const scope = {
      scope_id: "t3code",
      endpoint: "https://cache.example/projects/t3code",
      repository_id: "123",
      repository_owner_id: "456",
      branch: "refs/heads/feature/parent",
      policy_version: 1,
      writes_enabled: 1,
      pull_requests: 1,
    };
    const token = async (repository_id: string, audience = scope.endpoint) =>
      new SignJWT({
        repository_id,
        repository_owner_id: "456",
        repository_visibility: "public",
        event_name: "pull_request",
        ref: "refs/pull/42/merge",
        ref_type: "branch",
        base_ref: "feature/parent",
        actor: "maria",
      })
        .setProtectedHeader({ alg: "RS256", kid: "test" })
        .setIssuer(ISSUER)
        .setAudience(audience)
        .setIssuedAt(1000)
        .setNotBefore(1000)
        .setExpirationTime(1600)
        .sign(privateKey);
    const request = (value: string) =>
      new Request(scope.endpoint, { headers: { Authorization: `Bearer ${value}` } });
    const keys = async () => publicKey;
    expect(
      await authorizeCacheWrite(
        request(await token("123", "https://ci-reader:secret@cache.example/projects/t3code")),
        scope,
        keys,
      ),
    ).toMatchObject({ repository_id: "123" });
    await expect(
      authorizeCacheWrite(
        request(await token("123", "https://ci-reader:secret@other.example/projects/t3code")),
        scope,
        keys,
      ),
    ).rejects.toMatchObject({ status: 403 });
    await expect(
      authorizeCacheWrite(request(await token("another-repo")), scope, keys),
    ).rejects.toMatchObject({ status: 403 });
  } finally {
    vi.useRealTimers();
  }
});
