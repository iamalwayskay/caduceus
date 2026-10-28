import { assert, it } from "@effect/vitest";
import { RunId, ThreadId } from "@t3tools/contracts";
import * as Effect from "effect/Effect";

import { importProjectSessions, renameThread, type ThreadTools, waitForRun } from "./thread.ts";

const threadId = ThreadId.make("thread-1");
const runId = RunId.make("run-1");

/** Answers each tool call with the next scripted response for that tool. */
const scriptedTools = (script: Record<string, Array<unknown>>) => {
  const calls: Array<{ readonly tool: string; readonly args: unknown }> = [];
  const call = ((tool: string, args: unknown) => {
    calls.push({ tool, args });
    const next = script[tool]?.shift();
    return next === undefined ? Effect.die(`unscripted ${tool} call`) : Effect.succeed(next);
  }) as ThreadTools["call"];
  return { tools: { call } satisfies ThreadTools, calls };
};

it.effect("--wait follows the sent run to its continuation's terminal status", () =>
  Effect.gen(function* () {
    const continuation = RunId.make("run-2");
    const { tools, calls } = scriptedTools({
      t3_thread_wait: [
        { threadId, runId, status: "running", timedOut: true },
        { threadId, runId: continuation, status: "failed", timedOut: false },
      ],
      t3_thread_read: [{ thread: { pendingRequestCount: 0 } }],
    });

    const outcome = yield* waitForRun(tools, threadId, runId);

    assert.deepStrictEqual(outcome, { type: "ended", runId: continuation, status: "failed" });
    assert.deepStrictEqual(
      calls.filter((entry) => entry.tool === "t3_thread_wait").map((entry) => entry.args),
      [
        { threadId, runId, timeoutMs: 15_000 },
        { threadId, runId, timeoutMs: 15_000 },
      ],
    );
  }),
);

it.effect("--wait stops when the thread waits for an answer instead of polling forever", () =>
  Effect.gen(function* () {
    const { tools } = scriptedTools({
      t3_thread_wait: [
        { threadId, runId, status: "queued", timedOut: true },
        { threadId, runId, status: "queued", timedOut: true },
      ],
      t3_thread_read: [{ thread: { pendingRequestCount: 1 } }],
    });

    assert.deepStrictEqual(yield* waitForRun(tools, threadId, runId), { type: "needs_input" });
  }),
);

it.effect("--wait reports its run's result when a later run is the one waiting", () =>
  Effect.gen(function* () {
    const { tools } = scriptedTools({
      t3_thread_wait: [
        { threadId, runId, status: "running", timedOut: true },
        { threadId, runId, status: "completed", timedOut: false },
      ],
      t3_thread_read: [{ thread: { pendingRequestCount: 1 } }],
    });

    assert.deepStrictEqual(yield* waitForRun(tools, threadId, runId), {
      type: "ended",
      runId,
      status: "completed",
    });
  }),
);

it.effect("rename updates thread metadata through the authenticated MCP session", () =>
  Effect.gen(function* () {
    const renamed = {
      threadId,
      action: "rename" as const,
      commandId: "command-1",
      sequence: 1,
      title: "Useful title",
      titleRegeneration: null,
      linkedPullRequest: null,
      updatedAt: "2026-10-28T00:00:00.000Z",
    };
    const { tools, calls } = scriptedTools({ t3_thread_update: [renamed] });

    assert.deepStrictEqual(yield* renameThread(tools, threadId, "Useful title"), renamed);
    assert.deepStrictEqual(calls, [
      {
        tool: "t3_thread_update",
        args: { threadId, action: "rename", title: "Useful title" },
      },
    ]);
  }),
);

it.effect("import requests recent sessions for the resolved project", () =>
  Effect.gen(function* () {
    const projectId = "project-1" as never;
    const { tools, calls } = scriptedTools({
      t3_project_import_sessions: [{ importedCount: 13, skippedCount: 0 }],
    });

    assert.deepStrictEqual(yield* importProjectSessions(tools, projectId, "/home/kay"), {
      importedCount: 13,
      skippedCount: 0,
    });
    assert.deepStrictEqual(calls, [
      {
        tool: "t3_project_import_sessions",
        args: { projectId, expectedWorkspaceRoot: "/home/kay" },
      },
    ]);
  }),
);
