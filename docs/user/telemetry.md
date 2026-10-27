# Privacy and local diagnostics

Caduceus does not send product analytics, remote traces, build timings, or crash reports. It does
not read provider account files to create analytics identities. Environment variables and saved
settings cannot enable a remote observability exporter.

Log and NDJSON trace files remain on the machine running the environment and leave only when you
explicitly copy or share them. Live resource diagnostics can be requested by an authenticated
connected client and traverse that direct or Connect transport; they are not sent to a separate
analytics or observability service. Provider usage shown in the interface is local accounting for
the active conversation, not a Caduceus report.

## T3 Connect

T3 Connect is functional network transport, not telemetry. When you enable it, an authenticated
relay links your account, devices, and environment through a managed tunnel. The relay operator
necessarily receives connection metadata needed to carry and secure that traffic, including account
and environment identifiers, endpoints, timestamps, status, and ordinary network metadata.

Publishing agent activity for push notifications and Live Activities is a separate option. It is
off by default and can be enabled or disabled in the Connect settings.

For a connection that does not use the hosted relay, use a direct LAN or Tailscale connection.

## Inspect local diagnostics

Open **Settings > Maintenance > Diagnostics** to view local logs and resource information. Server
traces are written below the environment's data directory as NDJSON. Sharing any diagnostic file is
an explicit user action; inspect it first because errors and command metadata can contain project
paths or values from the work being debugged.
