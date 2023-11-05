describe("Example", () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  afterAll(async () => {
    await device.terminateApp();
  });

  it("should have welcome screen", async () => {
    await expect(element(by.id("welcome"))).toBeVisible();
  });
});
