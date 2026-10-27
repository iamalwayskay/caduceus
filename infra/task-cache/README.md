# Shared Vite Task cache

[Alchemy](https://alchemy.run) manages the `T3TaskCache` stack: the `t3-task-cache` Worker, its D1 index, private R2 bucket, rate limits, and cleanup schedule. The production stack adopts the existing resources and preserves their data and repository authorization policy. D1 and R2 have a retain removal policy.

The Worker uses Effect services for request handling, developer authentication, bounded concurrency, deadlines, and cleanup. The pinned [upstream protocol package](https://github.com/voidzero-dev/vite-plus-remote-cache-cloudflare/tree/5b06c2c10d84ea441735ba07c46f6d1b7cb2ff3b) supplies the experimental wire format, streaming upload, GitHub OIDC validation, and atomic D1 publication. Keeping that adapter preserves compatibility with existing cache entries.

Vite+ 1.3 includes an experimental remote client even though its TypeScript configuration and CLI help omit it. The native client reads `run.cache.remote.url`, `VP_REMOTE_CACHE_URL`, and `VP_REMOTE_CACHE`. An opt-in Node preload patches the Vite+ JavaScript entrypoint in memory and invokes an optional repository hook before and after the native task runner. The global executable and PATH are unchanged. Vite config loads saved credentials into its in-memory remote URL, and the hook selects the native cache mode. Saved credentials are never exported into task environments. Normal dependency installs do not patch Vite+. The hook is installed only by explicit maintainer setup or our own CI.

## Deploy

Install dependencies with `vp install`, then authenticate with Alchemy's Cloudflare profile. Alternatively, provide `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` through your environment. Alchemy stores deployment state remotely with `Cloudflare.state()`.

```sh
vp run --filter @t3tools/task-cache deploy
```

The stack reads read-only credential digests from `~/.config/t3-task-cache/readers.json` (or `READER_KEYS`) and writer digests from `~/.config/t3-task-cache/writers.json` and supplies them as a redacted Worker secret. Preserve that file to administer existing writers. Deployment uses the `prod` stage and the existing endpoint in `.task-cache.json`. The upstream protocol is loaded only inside the Worker runtime and bundled by Alchemy, so deployment runs on Node without an extra TypeScript loader. An explicit `DEVELOPER_KEYS` environment variable overrides the local registry, including on deployment hosts without that file. Deployment fails when neither source exists, so a missing local file cannot silently revoke existing writers.

The production database’s `scopes` and `deployment` records control repository identity, push branch, quotas, and retention. `pull_requests` explicitly enables same-repository PR uploads targeting the configured `branch`; `writes_enabled` disables all artifact uploads, including those from maintainers. Provisioning a separate cache requires its own repository policy; a new empty database does not grant uploads.

The CI read identity is named `ci-reader`. Its raw token belongs in the GitHub repository secret `T3_TASK_CACHE_READ_TOKEN`; `readers.json` maps that name to the token’s SHA-256 hex digest. To rotate it, replace that digest, deploy, then replace the GitHub secret. Keep the optional private `ci-reader.json` file as `{ "name": "ci-reader", "token": "…" }` for the smoke test to verify read-only restoration; without it, smoke uses the operator’s saved credential. Never commit these files. The read credential cannot upload artifacts.

## Add a contributor or machine

```sh
node infra/task-cache/scripts/manage.ts add-writer maria
```

This updates the local writer registry and writes `~/.config/t3-task-cache/maria.json`. Run `vp run --filter @t3tools/task-cache deploy` from the repository root to apply the registry, then transfer that file through a private channel. The recipient runs:

```sh
bash infra/task-cache/install.sh
```

The installer prompts for the endpoint, developer name, and token (hidden), validates the endpoint and credential shape locally, and saves credentials with mode `0600`. The first cache request reports rejected credentials. It installs the hook and credentials once in the home directory and enables the preload through `NODE_OPTIONS` in shell startup files. Open a fresh shell after setup. New worktrees and dependency reinstalls automatically use the same hook; no checkout or executable is modified. Existing long-running agents need to restart or inherit the updated environment. Rerunning setup updates the shared hook and restores matching backups from the old on-disk patch.

Uninstall with `bash infra/task-cache/install.sh --uninstall`, then restart existing shells and agents. This removes shell integration, saved client credentials, and any queue left by an older installation. A no-op preload remains for already-running shells that still inherit its path; no cache code runs through it. Administrative writer digests and issued credential files are preserved.

Explicit environment settings take precedence: `VP_REMOTE_CACHE_URL` may contain the URL-encoded developer name and token as HTTP Basic credentials, and `VP_REMOTE_CACHE=read-write` enables uploads. These can be supplied by a secret manager instead of saved credentials. Do not put credentials in shell command history or commit them. Use separate writer names for separate people. Repeating `add-writer` rotates the token; `revoke-writer <name>` removes it. Deploy again to apply either change.

Our repository’s CI explicitly installs the Vite+ hook. Same-repository PRs targeting `main` and default-branch push jobs read and write. PRs targeting other branches read only; fork PRs receive no cache credentials and run normally without remote caching. All artifact reads require authentication, including downloads by blob ID. Trusted maintainers automatically upload artifacts that other authenticated maintainers and CI consume. Deployment credentials are never needed on contributor machines or CI runners.

## Verify

```sh
node infra/task-cache/scripts/smoke.ts
vp run --filter @t3tools/task-cache test
vp run --filter @t3tools/task-cache typecheck
```

The smoke check uploads a unique fixture, restores its output into a cold second directory, changes its input, and confirms recomputation. It also checks that anonymous reads and uploads are rejected. Cacheable commands must run through `vp run`; direct `vp test` or `vp check` invocations do not use this cache.

## Native clients

`/projects/t3code/native-clients/<platform>/<variant>/<expo-fingerprint>` stores simulator and emulator development clients for `scripts/mobile-native-client.ts` in a separate `-native-clients` R2 bucket with 30-day retention. Unlike Vite Task entries, the Expo fingerprint is portable, so a client built on any Mac or Linux machine serves every other one. Readers download; writers upload through R2 multipart in 64 MB parts, because Workers cap request bodies. The uploader's bundle digest is stored as object metadata and checked by the client before it installs anything.

## Current limits

- Vite Task separates operating systems and CPU architectures. macOS results do not satisfy Linux CI; Linux developer machines can populate compatible CI results.
- The current protocol retains one result for each execution key. Competing source versions can overwrite each other's entry. Inputs are validated before reuse, so this causes misses rather than stale hits. Merging to main does not promote or reset the cache.
- A local hit makes no remote request and is not uploaded retroactively. Clear only an isolated worktree's task cache when testing uploads of an already-cached task.
- Production retains results for seven days within a 64 GB budget. Remote errors fall back to execution. `VP_REMOTE_CACHE=off vp run ...` disables the remote tier for one invocation.

Writer administration requires the complete private registry on the administering machine. Copy that registry securely from its administrator before adding a writer on another machine. `add-writer --new-registry` explicitly initializes a new cache; never use it to recover an existing registry.

Node processes running with filesystem permissions must allow the installed preload and hook directory. Remove the task-cache import from `NODE_OPTIONS` for a restricted process that cannot allow those files.
