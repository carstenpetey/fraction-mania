import Konva from "konva";

import { ButtonFactory } from "../../util/ButtonFactory.ts";

import type { Fraction } from "../../models/Fraction.ts";
import type { View } from "../../types.ts";

type ViewCallbacks = {
  onBack: () => void;
  onReset: () => void;
  onSliceClick: (fraction: Fraction) => void;
  onStart: () => void; // called when user clicks start button
  onReady?: () => void; // called after texture + UI are ready
  fractionOptions: Fraction[];
};

/**
 * Minigame1ScreenView (pure View)
 * - Knows how to draw pizza, buttons, HUD
 * - Delegates all game logic to the Controller/Model
 */
export class PizzaMinigameView implements View {
  private readonly group: Konva.Group = new Konva.Group({ visible: true });
  private readonly pizzaGroup: Konva.Group = new Konva.Group();
  private readonly uiGroup: Konva.Group = new Konva.Group();
  private readonly popupGroup: Konva.Group = new Konva.Group({ visible: true });

  private readonly width = window.innerWidth;
  private readonly height = window.innerHeight;

  // Big pizza position/size
  private readonly pizzaCenter = { x: this.width * 0.32, y: this.height * 0.58 };
  private readonly pizzaRadius = Math.min(480, Math.min(this.width, this.height) * 0.45);

  // Image assets
  private pizzaHTMLImage: HTMLImageElement | null = null;
  private basePizzaImageNode: Konva.Image | null = null;
  private readonly PIZZA_SRC = "/whole-pizza.png"; // served from /public

  // UI refs
  private sumText!: Konva.Text;
  private statusText!: Konva.Text;
  private pizzasCompletedText!: Konva.Text;
  private timerText!: Konva.Text;

  // track current answer choices
  private answerChoices: Konva.Group[] = [];

  // Callbacks + data from controller
  private readonly onBack: () => void;
  private readonly onReset: () => void;
  private readonly onSliceClick: (fraction: Fraction) => void;
  private readonly onStart: () => void;
  private readonly onReady?: () => void;
  private readonly fractionOptions: Fraction[];

  constructor(callbacks: ViewCallbacks) {
    this.onBack = callbacks.onBack;
    this.onReset = callbacks.onReset;
    this.onSliceClick = callbacks.onSliceClick;
    this.onStart = callbacks.onStart;
    this.onReady = callbacks.onReady;
    this.fractionOptions = callbacks.fractionOptions;

    // Order: background (root) -> pizzaGroup -> uiGroup -> popupGroup (on top)
    this.group.add(this.pizzaGroup);
    this.group.add(this.uiGroup);
    this.group.add(this.popupGroup);

    this.drawBackground();

    this.loadPizzaTexture().then(
      () => {
        this.drawPizzaBaseWithImage();
        this.drawHUD();
        this.drawButtons(this.fractionOptions);
        this.drawStartPopup();

        // Signal controller that the view is ready
        this.onReady?.();

        this.group.getLayer()?.draw();
      },
      () => console.error("Failed to load pizza texture"),
    );
  }

  // View interface
  getGroup(): Konva.Group {
    return this.group;
  }

  show(): void {
    this.group.visible(true);
    this.group.getLayer()?.draw();
  }

  hide(): void {
    this.group.visible(false);
    this.group.getLayer()?.draw();
  }

  // ---------------- Public methods for Controller ----------------

  public setCurrentFractionText(fraction: Fraction): void {
    if (!this.sumText) return;
    this.sumText.text(`Current: ${fraction.toString()}`);
    this.group.getLayer()?.batchDraw();
  }

  public setStatusText(message: string): void {
    if (!this.statusText) return;
    this.statusText.text(message);
    this.group.getLayer()?.batchDraw();
  }

  public updatePizzasCompleted(count: number): void {
    if (!this.pizzasCompletedText) return;
    this.pizzasCompletedText.text(`Pizzas completed: ${count}`);
    this.group.getLayer()?.batchDraw();
  }

  public updateTimer(seconds: number): void {
    if (!this.timerText) return;
    this.timerText.text(`Time: ${seconds}s`);
    this.group.getLayer()?.batchDraw();
  }

  public clearSlices(): void {
    this.pizzaGroup
      .getChildren((n) => n.getAttr("data-wedge") === true)
      .forEach((n) => n.destroy());
    this.group.getLayer()?.batchDraw();
  }

  /**
   * Draw one new slice using only Fractions for angles:
   * `previous` = total before adding, `slice` = new piece.
   */
  public addSliceVisual(previous: Fraction, slice: Fraction): void {
    if (!this.pizzaHTMLImage) return;

    const filled = previous.toDecimal();
    const add = slice.toDecimal();

    const start = -Math.PI / 2 + filled * Math.PI * 2;
    const end = start + add * Math.PI * 2;

    const d = this.pizzaRadius * 2 - 36;
    const g = new Konva.Group({
      x: this.pizzaCenter.x - d / 2,
      y: this.pizzaCenter.y - d / 2,
    });

    g.clipFunc((ctx) => {
      ctx.beginPath();
      ctx.moveTo(d / 2, d / 2);
      ctx.arc(d / 2, d / 2, d / 2, start, end, false);
      ctx.closePath();
    });

    g.add(
      new Konva.Image({
        image: this.pizzaHTMLImage,
        x: 0,
        y: 0,
        width: d,
        height: d,
      }),
    );
    g.setAttr("data-wedge", true);
    this.pizzaGroup.add(g);
    this.group.getLayer()?.batchDraw();
  }

  /**
   * Visual success feedback; controller decides when to reset the game.
   */
  public flashPizzaSuccess(): void {
    const glow = new Konva.Circle({
      x: this.pizzaCenter.x,
      y: this.pizzaCenter.y,
      radius: this.pizzaRadius + 24,
      stroke: "#22c55e",
      strokeWidth: 14,
      shadowColor: "#22c55e",
      shadowBlur: 32,
      shadowOpacity: 0.9,
      opacity: 0.9,
      listening: false,
    });

    this.pizzaGroup.add(glow);
    this.group.getLayer()?.batchDraw();

    const tween = new Konva.Tween({
      node: glow,
      duration: 0.5,
      opacity: 0,
      onFinish: () => {
        glow.destroy();
        this.group.getLayer()?.batchDraw();
      },
    });
    tween.play();
  }

  /**
   * copied positive feedback code from above to flash negative feedbakc on wrong answer
   * probbaly could make this more efficient if necessary
   */
  public flashPizzaOverflow(): void {
    const glow = new Konva.Circle({
      x: this.pizzaCenter.x,
      y: this.pizzaCenter.y,
      radius: this.pizzaRadius + 24,
      stroke: "#ef4444",
      strokeWidth: 14,
      shadowColor: "#ef4444",
      shadowBlur: 32,
      shadowOpacity: 0.9,
      opacity: 0.9,
      listening: false,
    });

    this.pizzaGroup.add(glow);
    this.group.getLayer()?.batchDraw();

    const tween = new Konva.Tween({
      node: glow,
      duration: 0.5,
      opacity: 0,
      onFinish: () => {
        glow.destroy();
        this.group.getLayer()?.batchDraw();
      },
    });
    tween.play();
  }

  // ---------------- Assets ----------------
  private async loadPizzaTexture(): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        this.pizzaHTMLImage = img;
        resolve();
      };
      img.onerror = (e) => reject(e);
      img.src = this.PIZZA_SRC;
    });
  }

  private drawBackground() {
    const bg = new Konva.Rect({
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
      fill: "#f8fafc",
    });
    this.group.add(bg);
    bg.moveToBottom();
  }

  private drawPizzaBaseWithImage() {
    if (!this.pizzaHTMLImage) return;

    // Subtle plate only
    const plate = new Konva.Circle({
      x: this.pizzaCenter.x,
      y: this.pizzaCenter.y,
      radius: this.pizzaRadius + 18,
      fill: "#e5e7eb",
      opacity: 0.3,
    });

    const d = this.pizzaRadius * 2 - 36; // inner diameter
    const x = this.pizzaCenter.x - d / 2;
    const y = this.pizzaCenter.y - d / 2;

    // Dimmed base pizza image so added slices pop
    this.basePizzaImageNode = new Konva.Image({
      image: this.pizzaHTMLImage,
      x,
      y,
      width: d,
      height: d,
      opacity: 0.25,
    });

    this.pizzaGroup.add(plate, this.basePizzaImageNode);
  }

  // ---------------- HUD ----------------
  private drawHUD() {
    // Back button (top-left)
    const backBtn = ButtonFactory.construct()
      .pos(24 + 180 / 2, 24 + 44 / 2)
      .text("Back to Menu")
      .onClick(() => this.onBack())
      .build();

    // timer display
    this.timerText = new Konva.Text({
      x: this.width - 200,
      y: 24,
      width: 180,
      text: `Time: 15s`,
      fontSize: 24,
      fontStyle: "bold",
      fontFamily: "Arial",
      fill: "#0f172a",
      align: "right",
    });

    // Right column anchor
    const colCenterX = this.width * 0.68;
    const colW = 420;
    const colX = colCenterX - colW / 2;

    const title = new Konva.Text({
      x: colX,
      y: 80,
      width: colW,
      text: "Make a whole pizza",
      fontSize: 34,
      fontStyle: "bold",
      fontFamily: "Arial",
      fill: "#0f172a",
      align: "center",
    });

    this.sumText = new Konva.Text({
      x: colX,
      y: 130,
      width: colW,
      text: `Current: 0/1`,
      fontSize: 22,
      fontFamily: "Arial",
      fill: "#0f172a",
      align: "center",
    });

    this.statusText = new Konva.Text({
      x: colX,
      y: 160,
      width: colW,
      text: "Click a fraction to add a slice",
      fontSize: 18,
      fontFamily: "Arial",
      fill: "#334155",
      align: "center",
    });

    // Reset button using ButtonFactory
    const resetBtn = ButtonFactory.construct()
      .pos(colCenterX, 190 + 44 / 2)
      .text("Reset Pizza")
      .onClick(() => this.onReset())
      .build();

    // Pizzas completed counter above main pizza
    const counterWidth = 260;
    const counterY = this.pizzaCenter.y - this.pizzaRadius - 40;
    const iconSize = 32;

    // Small pizza image icon to the left of the text
    let pizzaIcon: Konva.Image | Konva.Circle;
    if (this.pizzaHTMLImage) {
      pizzaIcon = new Konva.Image({
        image: this.pizzaHTMLImage,
        x: this.pizzaCenter.x - counterWidth / 2,
        y: counterY - iconSize / 2,
        width: iconSize,
        height: iconSize,
      });
    } else {
      pizzaIcon = new Konva.Circle({
        x: this.pizzaCenter.x - counterWidth / 2 + iconSize / 2,
        y: counterY,
        radius: iconSize / 2,
        fill: "#fde68a",
        stroke: "#b91c1c",
        strokeWidth: 2,
      });
    }

    this.pizzasCompletedText = new Konva.Text({
      x: this.pizzaCenter.x - counterWidth / 2 + iconSize + 8,
      y: counterY - 10,
      width: counterWidth - iconSize - 8,
      text: `Pizzas completed: 0`,
      fontSize: 18,
      fontFamily: "Arial",
      fill: "#0f172a",
      align: "left",
    });

    this.uiGroup.add(
      backBtn,
      this.timerText,
      title,
      this.sumText,
      this.statusText,
      pizzaIcon,
      this.pizzasCompletedText,
      resetBtn,
    );
  }

  private drawButtons(fracs: Fraction[]) {
    // Right column (under reset), centered
    const colCenterX = this.width * 0.68;
    const w = 280;
    const h = 56;
    const gap = 16;
    const startX = colCenterX - w / 2;
    const startY = 250;

    fracs.forEach((r, i) => {
      const y = startY + i * (h + gap);

      const btn = ButtonFactory.construct()
        .pos(startX + w / 2, y + h / 2) // ButtonFactory positions by center
        .text(r.toString())
        .onClick(() => this.onSliceClick(r))
        .build();

      // percent slice image to the right of the button
      const thumbRadius = 28;
      const thumb = this.makeSliceThumbnail(
        r,
        { x: startX + w + 18, y: y + (h - thumbRadius * 2) / 2 },
        thumbRadius,
      );

      this.uiGroup.add(thumb, btn);
      this.answerChoices.push(thumb, btn);
    });
  }

  /**
   * removes old answer choices, makes new ones
   */
  public updateButtons(newOptions: Fraction[]): void {
    // remove old answers
    this.answerChoices.forEach((node) => node.destroy());
    this.answerChoices = [];

    // make new answers
    this.drawButtons(newOptions);
    this.group.getLayer()?.batchDraw();
  }

  private makeSliceThumbnail(
    r: Fraction,
    pos: { x: number; y: number },
    radius: number,
  ): Konva.Group {
    const g = new Konva.Group({ x: pos.x, y: pos.y, width: radius * 2, height: radius * 2 });

    const start = -Math.PI / 2;
    const end = start + r.toDecimal() * Math.PI * 2;

    g.clipFunc((ctx) => {
      ctx.beginPath();
      ctx.moveTo(radius, radius);
      ctx.arc(radius, radius, radius, start, end, false);
      ctx.closePath();
    });

    if (this.pizzaHTMLImage) {
      const img = new Konva.Image({
        image: this.pizzaHTMLImage,
        x: 0,
        y: 0,
        width: radius * 2,
        height: radius * 2,
      });
      g.add(img);
    } else {
      // Fallback if image not ready
      g.add(
        new Konva.Circle({
          x: radius,
          y: radius,
          radius,
          fill: "#fde68a",
          stroke: "#b91c1c",
          strokeWidth: 2,
        }),
      );
    }

    return g;
  }

  // make the start game popup
  private drawStartPopup(): void {
    // make background overlay
    const overlay = new Konva.Rect({
      x: 0,
      y: 0,
      width: this.width,
      height: this.height,
      fill: "#000000",
      opacity: 0.6,
      listening: true,
    });

    const popupWidth = 500;
    const popupHeight = 300;
    const popupX = (this.width - popupWidth) / 2;
    const popupY = (this.height - popupHeight) / 2;

    const popupBg = new Konva.Rect({
      x: popupX,
      y: popupY,
      width: popupWidth,
      height: popupHeight,
      fill: "#ffffff",
      cornerRadius: 12,
      shadowColor: "#000000",
      shadowBlur: 10,
      shadowOpacity: 0.5,
    });

    const instructionText = new Konva.Text({
      x: popupX,
      y: popupY + 60,
      width: popupWidth,
      text: "Select a new slice from the choices and try to build a whole pizza!",
      fontSize: 22,
      fontFamily: "Arial",
      fill: "#0f172a",
      align: "center",
      padding: 20,
    });

    // start button from button factory
    const startBtn = ButtonFactory.construct()
      .pos(this.width / 2, popupY + popupHeight - 80)
      .text("Start")
      .width(180)
      .onClick(() => {
        this.hideStartPopup();
        this.onStart();
      })
      .build();

    this.popupGroup.add(overlay, popupBg, instructionText, startBtn);
  }

  public showStartPopup(): void {
    this.popupGroup.visible(true);
    this.group.getLayer()?.draw();
  }

  public hideStartPopup(): void {
    this.popupGroup.visible(false);
    this.group.getLayer()?.draw();
  }
}

export default PizzaMinigameView;
