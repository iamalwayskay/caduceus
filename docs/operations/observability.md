# Local observability

Caduceus keeps operational diagnostics on the environment host. It has no OTLP exporter, remote
endpoint test, hosted trace sink, or environment-variable escape hatch that sends these signals.

## Logs

The CLI writes server logs to stdout and the service manager captures them when Caduceus runs as a
background service. Desktop renderer and main-process logs are available from the desktop
diagnostics surface. Treat logs as sensitive: provider errors and command metadata can contain
project paths or values from the work being debugged.

## Traces

The server writes local NDJSON traces below its data directory. Use the Diagnostics settings to find
the active environment and inspect its local files. A trace record contains span timing, status,
resource attributes, and structured events. No process uploads the file; copying or sharing it is an
explicit operator action.

To summarize a trace without sending it anywhere, use normal local tools such as `jq`, `rg`, and
`sort`. Start with failed spans and the longest durations, then follow parent span identifiers to the
request, provider turn, source-control operation, or hook boundary that owns the work.

## Resource diagnostics

**Settings > Maintenance > Diagnostics** shows local CPU, memory, process, and event-loop state for
the selected environment. These snapshots are read from the host and displayed to the connected
client; they are not retained in a telemetry database or exported to a third-party receiver.

## Instrumentation policy

Instrumentation should describe useful local boundaries rather than tiny helpers. Keep
high-cardinality values on local spans and metric labels bounded. Do not add network exporters,
crash uploaders, analytics identities, endpoint probes, or build-reporting side channels without an
explicit change to Caduceus's privacy contract.

## Heap snapshots

Heap snapshots and CPU profiles are local debugging artifacts. Capture them only on the environment
being investigated, store them outside version control, and delete them when the investigation is
complete. They may contain source text, paths, prompts, or credentials present in process memory.
