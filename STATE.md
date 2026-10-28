# State

## Decision

Caduceus is Kay's private, telemetry-free fork of `pingdotgg/t3code`. It keeps the local control
plane, provider adapters, ACP support, local diagnostics, updates, local pairing, and direct saved
environments. It removes product analytics, remote OTLP/Axiom export, crash and source-map uploads,
build/task reporting, T3 Connect, Clerk authentication, hosted relay transport, managed
cloudflared, and agent-activity publishing. Saved settings and environment variables cannot
re-enable those paths.

## Provider model

T3 remains the control plane. Hermes and DeepSeek Harness stay separate rather than having their
code folded into the fork. Ordinary Git-backed project files are the shared memory authority;
Hermes supplies its own durable learning in `~/.hermes/memories/MEMORY.md`. Automatic post-thread
curation of project files is not implemented, and no custom memory MCP is needed merely to share
files between agents.

## Current status

- Haven still runs the earlier verified private CLI deployment. The laptop desktop artifact is
  rebuilt separately from the final `telemetry-free` commit; its commit and hashes are recorded in
  the installed release directory's `MANIFEST` after installation.
- KPC has the native Caduceus AppImage installed inside the fork at
  `/home/kay/Code/AI/apps/caduceus/release/Caduceus-0.1.3-x86_64.AppImage`, with its application-menu
  entry at `~/.local/share/applications/caduceus.desktop`. It uses
  `/home/kay/Code/AI/data/caduceus`, opens the primary Caduceus repository on `main`, and serves its
  bundled backend on `0.0.0.0:3773` while the app is open. Its project tree mirrors Kay's GPT
  sidebar: Mirius, Mirieth, Projectless (`/home/kay`), AI, Thalamus, Lutristy, and Ivorae. UFW restricts
  non-loopback access to the home LAN and WireGuard. The former standalone user service is disabled to prevent two
  processes from owning the same state directory. The CLI launcher remains
  `/home/kay/.local/bin/caduceus`. The installed
  AppImage SHA-256 is `548c34827ed9deb55e36864308c47df4dd61154ae653efa2bf8d47ea5f198073`.
- Codex, Claude, and DeepSeek Harness ACP are enabled. Hermes remains installed as the separate
  recursive-learning application, but it is not duplicated in the model picker. DSH's
  112-model catalog appears as three provider groups: local Qwen 3.8 and Decider 2B, 74 Venice
  models, and 36 OpenCode Go models. DSH defaults to local Qwen 3.8. Venice is injected only into
  the DSH child by Thalamus; OpenCode Go uses DSH's protected credential reference. Claude is
  installed at `/home/kay/.local/bin/claude`; authentication remains owned by Claude Code.
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
- The permanent, collapsible project-tree sidebar is the default on every Caduceus client; projects
  contain their threads, matching Kay's GPT navigation instead of hiding projects in a filter.
- `t3 thread rename <thread> <title>` renames imported or native threads through the authenticated
  local MCP session; the imported GPT threads have concise subject titles instead of raw prompts.
- `t3 thread import <project>` imports all saved Claude and Codex history through the authenticated
  local MCP session, including sessions older than 30 days and Codex's `.jsonl.zst` archives. An
  explicitly registered home project may import `/home/kay` sessions, while automatic discovery
  still excludes the home directory.
- Projectless imports ordinary conversations while archived threads and review subagents remain
  outside that sidebar count. The importer reads Codex's authoritative desktop titles and project
  assignments, excludes agent-created child threads, and refreshes stale imported titles without
  replaying messages. Malformed or over-limit transcripts are skipped without aborting the import.
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

## 2026-10-28 — provider picker groups

- The desktop model picker now exposes exactly Codex, Claude, DSH: Local models, Venice, and
  OpenCode Go. DSH's single 112-model ACP catalog is registered as three instances and filtered by
  the encoded model provider, so local, Venice, and OpenCode models no longer appear as repeated
  generic subscription rows. Hermes remains installed but its duplicate picker instances are
  disabled.

## 2026-10-28 — corrective desktop release

- GUI provider discovery now adds `~/.local/bin` and `~/bin`; Claude no longer fails with
  `spawn claude ENOENT` when launched from the desktop menu.
- Generated `t3code://` handlers retain only the required `T3CODE_HOME` and LAN-host environment,
  so a link cannot reopen an unrelated onboarding state under `~/.t3`.
- On Linux, closing the final window leaves the local backend running for paired phone and LAN
  clients. Launching Caduceus again recreates the main window; explicit Quit still stops it.
- Hermes's three empty ACP sessions with invalid blank-model policies were removed after a state
  snapshot. A live one-shot turn created and read back its built-in `MEMORY.md` successfully.
- The accidental raw-launch state under `~/.t3` was moved to the desktop Trash. The previous
  desktop artifact, CLI, and generated URL-handler entry are preserved in
  `/home/kay/Archive/caduceus-release-provenance-2026-10/`.
