import { expect, it } from "vite-plus/test";

import { newConnectOnboardingSelection } from "./connectOnboarding";

it("requires an explicit choice before publishing agent activity", () => {
  expect(newConnectOnboardingSelection()).toEqual({
    exposeEnvironment: true,
    publishAgentActivity: false,
  });
});
