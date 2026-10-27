# Relay diagnostics

The Caduceus relay does not provision Axiom, expose a mobile telemetry ingest route, or export
OpenTelemetry data. Runtime spans and annotations may remain as local structured context, but no
exporter consumes them.

Operate the relay through Cloudflare Worker logs, queue state, database state, and the functional
health endpoints documented in the [relay README](../../infra/relay/README.md). Do not add a remote
observability backend as an implicit dependency of Connect; a future deployment-specific exporter
requires an explicit privacy decision and separate configuration outside this fork.
