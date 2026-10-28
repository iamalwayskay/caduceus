# State

## Decision

Caduceus is Kay's private, telemetry-free fork of `pingdotgg/t3code`. It keeps the local control
plane, provider adapters, ACP support, local diagnostics, updates, local pairing, and direct saved
environments. It removes product analytics, remote OTLP/Axiom export, crash and source-map uploads,
build/task reporting, T3 Connect, Clerk authentication, hosted relay transport, managed
cloudflared, and agent-activity publishing. Saved settings and environment variables cannot
re-enable those paths.

## Provider model

T3 remains the control plane. Hermes and DeepSeek Harness are separate ACP providers rather than
code folded into the fork. Ordinary Git-backed project files are the shared memory authority;
Hermes curates and learns from those files. No custom memory MCP exists or is needed.

## Current status

- Commit `b32b01407c` is deployed on the laptop and Haven. The Linux x64 archive SHA-256 is
  `7f5e2152c39fb653563787156deafa83bee27ad288dd96fd4e8a9ca6442ca15a`.
- KPC has the native Caduceus AppImage installed inside the fork at
  `/home/kay/Code/AI/apps/caduceus/release/Caduceus-0.1.3-x86_64.AppImage`, with its application-menu
  entry at `~/.local/share/applications/caduceus.desktop`. It uses
  `/home/kay/Code/AI/data/caduceus`, opens the primary Caduceus repository on `main`, and serves its
  bundled backend on `0.0.0.0:3773` while the app is open. Fifty projects are registered: the
  top-level repositories under `~/Code`, the five AI repositories, the active brand workspaces,
  Mirius, and the existing imported workspaces. The legacy `/home/kay/Code/AI` entry remains only
  because it owns one imported thread and the non-destructive project removal correctly refused to
  delete that history. UFW restricts
  non-loopback access to the home LAN and WireGuard. The former standalone user service is disabled to prevent two
  processes from owning the same state directory. The CLI launcher remains
  `/home/kay/.local/bin/caduceus`. The installed
  AppImage SHA-256 is `c8f3d4ddb063bd1810cad0d20db6826007e8326c3ea49f7e37c518d39d0563cc`.
- Codex, Hermes ACP, and DeepSeek Harness ACP are enabled. Generic Hermes keeps its imported OpenAI
  Codex session and frontier model picker. Three safe-mode Hermes instances pin every installed
  local Ollama model: `qwen3.8:latest`, `qwen3:4b-instruct-2507-q4_K_M`, and
  `decider-2b:latest`; the Ollama `qwen3.5:cloud` pointer is correctly not labelled local. DSH ACP
  exposes one universal 112-model picker: local Qwen 3.8 and Decider 2B, 74 Venice models, and 36
  OpenCode Go models. DSH defaults to local Qwen 3.8. Venice is injected only into the DSH child by
  Thalamus; OpenCode Go uses DSH's protected credential reference. Claude is installed but not
  authenticated.
- Haven runs `caduceus.service` as locked account `svc-caduceus`, binds only
  `127.0.0.1:3773`, and can write only `/srv/caduceus/data`. Its unit permits `AF_NETLINK` because
  Node's `os.networkInterfaces()` needs it for direct-environment configuration.
- The laptop exposes Haven only at `127.0.0.1:3774` through the existing WireGuard route and a
  restricted, forwarding-only SSH key. Caduceus saves Haven as a direct environment; no T3 account
  or hosted infrastructure participates. Forced tunnel outage and automatic recovery passed.
- KPC's desktop backend accepts authenticated clients at `192.168.1.185:3773` on the home LAN and
  `10.77.0.2:3773` over WireGuard. UFW limits port 3773 to the home subnet and `wg0`; phone pairing
  uses one-time local tokens and no hosted relay.
- The `upstream` remote fetches only `upstream/main`; 2,148 unrelated upstream branch refs were
  removed so the app's branch picker no longer resembles a list of extra checkouts.
- The `telemetry-free` development worktree is no longer an app project. The primary Caduceus
  checkout on `main` is registered instead, so the composer does not default to the fork branch or
  ask to initialize Git for the non-repository AI container. The checkout/branch controls remain
  unchanged and operate on whichever project Kay selects.
- Desktop activation now targets the primary Caduceus checkout rather than the last imported empty
  draft. The Usage page defaults to token usage instead of cost or provider limits, because local
  Hermes/DSH models have transcript tokens but no subscription-limit window and may be unpriced.
- Codex uses the explicit desktop-safe executable path `/usr/lib/chatgpt/resources/codex`; provider
  health reports ready with eight models even when the graphical launcher has a restricted PATH.
- Sidebar thread shelves flow directly beneath Search; settled conversations are no longer pinned
  to the bottom of an otherwise empty sidebar.
- The release smoke test, runtime endpoint scan, missing-`connect` CLI check, both loopback listener
  checks, HTTP health, service restart, restricted-key denial, and legacy Connect-state scan passed.
  Retired Connect keys and cloudflared binaries are preserved under
  `/home/kay/Archive/caduceus-connect-retired-2026-10` on the laptop and the corresponding
  `-haven` archive on Haven.
- A quiesced Haven durable-data backup was copied to
  `/home/kay/Backups/Haven/caduceus/2026-10-27-final/`, hash-verified, and scratch-extracted. The
  Git project checkout is reproducible from the private fork and is not duplicated in that backup.
- Haven's real reboot acceptance test remains outstanding because rebooting the machine requires
  Kay's explicit approval.

## Trap

The upstream App Store and Play Store clients are not Caduceus builds and are not covered by this
fork's telemetry-free guarantee. The installed KPC desktop package and local web/server client are
Caduceus builds; a signed Caduceus mobile build remains a separate deliverable.
