import { expect, it, vi } from "vite-plus/test";

const hostedImports = vi.hoisted(() => ({
  linkState: false,
  controller: false,
  authentication: false,
  environmentList: false,
}));

vi.mock("~/cloud/primaryCloudLinkState", () => {
  hostedImports.linkState = true;
  return { usePrimaryCloudLinkState: () => ({ data: null }) };
});
vi.mock("~/cloud/useCloudLinkController", () => {
  hostedImports.controller = true;
  return { useCloudLinkController: () => ({}) };
});
vi.mock("~/components/clerk/useT3ConnectAuthPrompt", () => {
  hostedImports.authentication = true;
  return { useT3ConnectAuthPrompt: () => ({ openAuthPrompt: () => undefined }) };
});
vi.mock("~/components/cloud/CloudEnvironmentConnectList", () => {
  hostedImports.environmentList = true;
  return { CloudEnvironmentConnectRows: () => null };
});

it("loads private environment settings without the hosted Connect runtime", async () => {
  await Promise.all([
    import("./SavedEnvironmentRows"),
    import("./useAvailableSettingsSearchItems"),
  ]);

  expect(hostedImports).toEqual({
    linkState: false,
    controller: false,
    authentication: false,
    environmentList: false,
  });
});
