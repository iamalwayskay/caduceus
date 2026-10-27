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
- The laptop launcher is `/home/kay/.local/bin/caduceus`; state is
  `/home/kay/Code/AI/data/caduceus`. Its user service is enabled and serves the local app on port
  `127.0.0.1:3773`. The upstream stock runtime remains preserved but stopped.
- Codex, Hermes ACP, and DeepSeek Harness ACP are enabled. Hermes uses its own imported OpenAI Codex
  session with `gpt-6.1-sol`; DeepSeek Harness reports `deepseek-v4-flash`. Claude is installed but
  not authenticated.
- Haven runs `caduceus.service` as locked account `svc-caduceus`, binds only
  `127.0.0.1:3773`, and can write only `/srv/caduceus/data`. Its unit permits `AF_NETLINK` because
  Node's `os.networkInterfaces()` needs it for direct-environment configuration.
- The laptop exposes Haven only at `127.0.0.1:3774` through the existing WireGuard route and a
  restricted, forwarding-only SSH key. Caduceus saves Haven as a direct environment; no T3 account
  or hosted infrastructure participates. Forced tunnel outage and automatic recovery passed.
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
fork's telemetry-free guarantee. This rollout uses the fork's local web/server client until a signed
Caduceus mobile build is produced and verified.
