# State

## Decision

Caduceus is Kay's telemetry-free fork of `pingdotgg/t3code`. It keeps the upstream control plane,
provider adapters, ACP support, local diagnostics, updates, and explicit T3 Connect transport. It
removes product analytics, analytics identities, remote OTLP/Axiom export, crash uploads, source-map
uploads, and build/task reporting. Environment variables and saved settings must not re-enable
those paths.

T3 Connect is not presented as private local transport: its operator necessarily sees connection
metadata required to authenticate and carry traffic. Publishing agent activity is optional and
defaults off.

## Provider model

T3 remains the control plane. Hermes and DeepSeek Harness are separate ACP providers rather than
code folded into the fork. Git-backed project files are the shared memory authority between hosts;
Connect routes work but does not synchronize project files.

## Current status

- Telemetry removal is implemented across server, web, desktop, mobile, relay, and build tooling;
  integrated verification is still in progress.
- Hermes' local runtime and ACP dependencies have been repaired on the laptop; provider registration
  in the built Caduceus runtime is pending.
- DeepSeek Harness is already installed locally; its ACP registration is pending.
- The Caduceus CLI archive has not yet been built or deployed.
- Laptop and Haven services, Connect linking, and real network-egress verification remain pending.
- The upstream stock T3 service remains stopped.

## Trap

The upstream App Store and Play Store clients are not Caduceus builds and are not covered by this
fork's telemetry-free guarantee. This rollout uses the fork's local web/server client until a signed
Caduceus mobile build is produced and verified.
