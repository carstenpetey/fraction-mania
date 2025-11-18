// importing modules to test
import { expect, test } from "@playwright/test";

// beginning test suite. will be testing buttons
test.describe("E2E: Application Navigation and Interaction", () => {
  test.beforeEach(async ({ page }) => {
    // start the test by navigating to the base URL
    await page.goto("http://localhost:5173");
  });

  // ==========================================================
  // TEST 1: clicking START GAME in main menu
  // ==========================================================
  test("Should transition from Menu to the next screen when START GAME is clicked", async ({
    page,
  }) => {
    // retrieving the div that contains the Konva layer
    const container = page.locator("#app");

    // wait until the div is visible (aka stuff is on the screen)
    await expect(container).toBeVisible();

    // used to retrieve the position and size of a located element on the web page
    const box = await container.boundingBox();

    // could be null, so make sure we cover that case
    if (!box) throw new Error("Container bounding box was null — container not rendered.");

    // getting location of the button (as defined in MainMenuScreeView.ts)
    const targetX = box.width / 2;
    const targetY = 3 * (box.height / 5) + 20;

    // in order to check if the button succesfully takes us to another screen, the screen before pressing the button should be different than the screen after pressing the button
    // thus, we take a 'screenshot'
    const before = await container.screenshot();

    // clicking the button at desired
    await page.mouse.click(targetX, targetY);

    // taking screenshot after
    const after = await container.screenshot();

    // compare. this should verify that the button was pressed successfully
    expect(before).not.toEqual(after);
  });

  // ==========================================================
  // TEST 2: clicking HELP in main menu
  // ==========================================================
  test("Should transition from Menu to next screen when HELP is clicked", async ({ page }) => {
    // retrieving the div that contains the Konva layer
    const container = page.locator("#app");

    // wait until the div is visible (aka stuff is on the screen)
    await expect(container).toBeVisible();

    // used to retrieve the position and size of a located element on the web page
    const box = await container.boundingBox();

    // could be null, so make sure we cover that case
    if (!box) throw new Error("Container bounding box was null — container not rendered.");

    // getting location of the button (as defined in MainMenuScreeView.ts)
    const targetX = box.width / 2;
    const targetY = 4 * (box.height / 5);

    // in order to check if the button succesfully takes us to another screen, the screen before pressing the button should be different than the screen after pressing the button
    // thus, we take a 'screenshot'
    const before = await container.screenshot();

    // clicking the button at desired
    await page.mouse.click(targetX, targetY);

    // taking screenshot after
    const after = await container.screenshot();

    // compare. this should verify that the button was pressed successfully
    expect(before).not.toEqual(after);
  });

  // ==========================================================
  // TEST 3: changing difficulty in main menu
  // ==========================================================
  test("Should switch selection from EASY to MEDIUM when MEDIUM is clicked", async ({ page }) => {
    // retrieving the div that contains the Konva layer
    const container = page.locator("#app");

    // wait until the div is visible (aka stuff is on the screen)
    await expect(container).toBeVisible();

    // get the canvas bounds
    const box = await container.boundingBox();

    // could be null, so make sure we cover that case
    if (!box) throw new Error("No bounding box");

    // defining where to click difficulty from definintion in MainMenuScreenView.ts
    const DIFFICULTY_Y = box.y + 2.5 * (box.height / 5);
    const CLICK_X = box.x + box.width / 2 + 40;

    // Ttake screenshot before button is clicked
    const before = await container.screenshot({ type: "png" });

    // click at the desired location
    await page.mouse.click(CLICK_X, DIFFICULTY_Y);

    // take screenshot after
    const after = await container.screenshot({ type: "png" });

    // if clicked successfully, medium is now bolded, meaning the pixels have changed and the screenshots should be different
    expect(before).not.toEqual(after);
  });
});
