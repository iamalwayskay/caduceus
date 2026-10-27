import { decodeJwt, type JWTVerifyGetKey } from "jose";
import { authorize } from "../vendor/vite-plus-remote-cache-cloudflare/src/auth.ts";
import type { Scope } from "../vendor/vite-plus-remote-cache-cloudflare/src/database.ts";
import { HttpError } from "../vendor/vite-plus-remote-cache-cloudflare/src/errors.ts";

function audienceScope(request: Request, scope: Scope) {
  const authorization = request.headers.get("authorization");
  if (!authorization || authorization.length > 16 * 1024) throw new HttpError(401, "invalid_token");
  let payload;
  try {
    payload = decodeJwt(authorization.slice(7));
  } catch {
    throw new HttpError(401, "invalid_token");
  }
  let endpoint = scope.endpoint;
  if (typeof payload.aud === "string") {
    try {
      const audience = new URL(payload.aud);
      audience.username = "";
      audience.password = "";
      if (audience.href.replace(/\/$/, "") === scope.endpoint.replace(/\/$/, ""))
        endpoint = payload.aud;
    } catch {
      // The verified authorization below rejects malformed and foreign audiences.
    }
  }
  return { ...scope, endpoint };
}

export async function authorizeCacheWrite(request: Request, scope: Scope, keys: JWTVerifyGetKey) {
  return authorize(request, audienceScope(request, scope), keys);
}
