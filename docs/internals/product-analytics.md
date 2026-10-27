# Product analytics policy

Caduceus has no product analytics pipeline. The server does not construct installation or account
identities for analytics, and clients do not load an analytics SDK. There is no environment or
settings switch that enables analytics.

Local resource diagnostics, local trace files, and provider-context accounting are intentionally
retained. They are application state on the environment host, not outbound reporting.

T3 Connect is an explicit remote-control feature and remains networked. Its transport metadata is
covered separately in the [user privacy guide](../user/telemetry.md#t3-connect).
