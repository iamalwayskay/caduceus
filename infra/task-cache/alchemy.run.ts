import { adopt } from "alchemy/AdoptPolicy";
import * as Alchemy from "alchemy";
import * as Cloudflare from "@alchemy.run/cloudflare";
import * as Effect from "effect/Effect";
import * as Secrets from "alchemy/Secrets";
import { WriterSecrets } from "./src/deploymentConfig.ts";
import * as Worker from "./src/worker.ts";

export default Alchemy.Stack(
  "T3TaskCache",
  {
    providers: Cloudflare.providers(),
    state: Cloudflare.state(),
    secrets: [Secrets.DotEnv(), Secrets.ProcessEnv(), WriterSecrets],
  },
  Effect.gen(function* () {
    const worker = yield* Worker.Worker;
    return { url: worker.url, workerName: worker.workerName };
  }).pipe(Effect.provide(Worker.layer), adopt(true)),
);
