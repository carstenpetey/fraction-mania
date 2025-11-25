// import { expect, test } from "@playwright/test";

// test.describe("E2E: Equation Screen Behavior", () => {
//   test.beforeEach(async ({ page }) => {
//     await page.goto("http://localhost:5173");

//     // we have to get to the equation screen by clicking start game
//     // therefore we simulate getting there by clicking start button
//     const container = page.locator("#app");
//     await expect(container).toBeVisible();

//     const box = await container.boundingBox();
//     if (!box) throw new Error("Cannot get bounding box");

//     // START GAME button coordinates
//     const startX = box.width / 2;
//     const startY = 3 * (box.height / 5) + 20;

//     await page.mouse.click(startX, startY);

//     await page.waitForTimeout(300);
//   });

//   // ==========================================================
//   // TEST 1 — expression box has text (not blank)
//   // ==========================================================
//   test("Expression should appear inside the expression box", async ({ page }) => {
//     // retrieving the div that contains the Konva layer
//     const container = page.locator("#app");

//     // getting boundary of screen
//     const box = await container.boundingBox();
//     if (!box) throw new Error("No bounding box");

//     // coordinates to the equation box, as defined in QuesteionScreenView.ts
//     const clip = {
//       x: box.x + box.width / 2 - 200,
//       y: box.y + box.height / 5 - 50,
//       width: 400,
//       height: 150,
//     };

//     // screenshot the box
//     const screenshot = await page.screenshot({ clip });

//     // make sure the image isn't empty and something actually appears
//     expect(screenshot.length).toBeGreaterThan(0);
//   });

//   // ==========================================================
//   // TEST 2 — clicking a button should trigger feedback (button turns green or red)
//   // ==========================================================
//   test("Clicking an answer should cause a temporary color change", async ({ page }) => {
//     // retrieving the div that contains the Konva layer
//     const container = page.locator("#app");
//     await expect(container).toBeVisible();

//     // getting boundary of screen
//     const box = await container.boundingBox();
//     if (!box) throw new Error("No bounding box");

//     // answer button layout, as defined in QuestionScreenView.ts
//     const btnWidth = 150;
//     const btnHeight = 100;
//     const spacing = 20;
//     const startX = (box.width - (4 * btnWidth + 3 * spacing)) / 2;
//     const yPos = (box.height * 3) / 5;

//     // we need a button to test, so we will click the second button
//     const index = 1;

//     // getting the x and y coordinates of the second button
//     const btnX = Math.round(box.x + startX + index * (btnWidth + spacing) + btnWidth / 2);
//     const btnY = Math.round(box.y + yPos + btnHeight / 2);

//     // we want to take a screenshot of just the box we are clicking to see if it changes color
//     const clipRegion = {
//       x: Math.round(box.x + startX + index * (btnWidth + spacing)),
//       y: Math.round(box.y + yPos),
//       width: Math.round(btnWidth),
//       height: Math.round(btnHeight),
//     };

//     // taking screenshot before clicking
//     const before = await page.screenshot({ clip: clipRegion });

//     // clicking
//     await page.mouse.click(btnX, btnY);
//     await page.waitForTimeout(50);

//     // taking screenshot after clicking
//     const afterFlash = await page.screenshot({ clip: clipRegion });

//     // should be different as after picture is colored
//     expect(before).not.toEqual(afterFlash);
//   });
// });
