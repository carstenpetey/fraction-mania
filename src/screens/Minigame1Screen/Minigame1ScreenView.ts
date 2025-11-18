import Konva from "konva";

import type { View } from "../../types.ts";

// --------- Minimal Rational helper ----------
function gcd(a: number, b: number): number {
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return Math.max(1, Math.abs(a));
}

class Rational {
  readonly n: number;
  readonly d: number;
  constructor(n: number, d: number) {
    if (d === 0) throw new Error("denominator cannot be 0");
    const sign = d < 0 ? -1 : 1;
    const nn = n * sign;
    const dd = Math.abs(d);
    const g = gcd(Math.abs(nn), dd);
    this.n = nn / g;
    this.d = dd / g;
  }
  static zero() {
    return new Rational(0, 1);
  }
  static one() {
    return new Rational(1, 1);
  }
  toNumber() {
    return this.n / this.d;
  }
  toString() {
    return `${this.n}/${this.d}`;
  }
  add(r: Rational) {
    return new Rational(this.n * r.d + r.n * this.d, this.d * r.d);
  }
  sub(r: Rational) {
    return new Rational(this.n * r.d - r.n * this.d, this.d * r.d);
  }
  gt(r: Rational) {
    return this.n * r.d > r.n * this.d;
  }
  closeTo(r: Rational, eps: Rational) {
    return this.sub(r).abs().toNumber() <= eps.toNumber();
  }
  abs() {
    return new Rational(Math.abs(this.n), this.d);
  }
  clampMinZero() {
    return this.gt(Rational.zero()) ? this : Rational.zero();
  }
}

/**
 * Minigame1ScreenView
 * - Big pizza image on center-left (no orange crust fill)
 * - Buttons on the right with image slice thumbnails next to each option
 * - Back to Menu + Reset, rational arithmetic
 */
export class Minigame1ScreenView implements View {
  private readonly group: Konva.Group = new Konva.Group({ visible: true });
  private readonly pizzaGroup: Konva.Group = new Konva.Group();
  private readonly uiGroup: Konva.Group = new Konva.Group();

  private readonly width = window.innerWidth;
  private readonly height = window.innerHeight;

  // Big pizza position/size
  private readonly pizzaCenter = { x: this.width * 0.32, y: this.height * 0.58 };
  private readonly pizzaRadius = Math.min(480, Math.min(this.width, this.height) * 0.45);

  // Image assets
  private pizzaHTMLImage: HTMLImageElement | null = null;
  private basePizzaImageNode: Konva.Image | null = null;
  private readonly PIZZA_SRC = "/whole-pizza.png"; // served from /public

  // Game state
  private current: Rational = new Rational(1, 1);
  private readonly epsilon = new Rational(1, 1000);

  // UI refs
  private sumText!: Konva.Text;
  private statusText!: Konva.Text;
  private readonly onBack?: () => void;

  constructor(onBack?: () => void) {
    this.onBack = onBack;

    // Order: background (root) -> pizzaGroup -> uiGroup
    this.group.add(this.pizzaGroup);
    this.group.add(this.uiGroup);

    this.drawBackground();

    this.loadPizzaTexture().then(
      () => {
        this.drawPizzaBaseWithImage();
        this.drawHUD();
        this.drawButtons([
          new Rational(1, 4),
          new Rational(1, 8),
          new Rational(1, 2),
          new Rational(1, 3),
        ]);
        this.group.getLayer()?.draw();
      },
      () => console.error("We are coocked"),
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

  // ---------------- Drawing ----------------
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

    // Subtle plate only (remove orange crust fill)
    const plate = new Konva.Circle({
      x: this.pizzaCenter.x,
      y: this.pizzaCenter.y,
      radius: this.pizzaRadius + 18,
      fill: "#e5e7eb",
      opacity: 0.3,
    });

    // Full pizza image (dim base so added slices pop)
    const d = this.pizzaRadius * 2 - 36; // inner diameter
    const x = this.pizzaCenter.x - d / 2;
    const y = this.pizzaCenter.y - d / 2;

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

  private drawHUD() {
    // Back button (top-left)
    const backBtn = this.makeButton({
      x: 24,
      y: 24,
      w: 180,
      h: 44,
      label: "Back to Menu",
      onClick: () => this.onBack?.(),
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

    const resetBtn = new Konva.Group({ x: colCenterX - 130, y: 190 });
    const resetRect = new Konva.Rect({
      width: 260,
      height: 44,
      cornerRadius: 12,
      fill: "#ffffff",
      stroke: "#94a3b8",
      strokeWidth: 2,
      shadowColor: "black",
      shadowOpacity: 0.08,
      shadowBlur: 8,
      shadowOffset: { x: 0, y: 2 },
    });
    const resetTxt = new Konva.Text({
      x: 0,
      y: 0,
      width: 260,
      height: 44,
      align: "center",
      verticalAlign: "middle",
      text: "Reset",
      fontSize: 22,
      fontFamily: "Arial",
      fill: "#0f172a",
    });
    resetBtn.add(resetRect, resetTxt);
    resetBtn.on("mouseenter", () => {
      resetRect.fill("#f1f5f9");
      const stage = resetBtn.getStage();
      if (stage) stage.container().style.cursor = "pointer";
      this.group.getLayer()?.batchDraw();
    });
    resetBtn.on("mouseleave", () => {
      resetRect.fill("#ffffff");
      const stage = resetBtn.getStage();
      if (stage) stage.container().style.cursor = "default";
      this.group.getLayer()?.batchDraw();
    });
    resetBtn.on("click", () => this.resetGame());

    this.uiGroup.add(backBtn, title, this.sumText, this.statusText, resetBtn);
  }

  private drawButtons(fracs: Rational[]) {
    // Right column (under reset), centered
    const colCenterX = this.width * 0.68;
    const w = 280;
    const h = 56;
    const gap = 16;
    const startX = colCenterX - w / 2;
    const startY = 250;

    fracs.forEach((r, i) => {
      const y = startY + i * (h + gap);

      // Button
      const btn = this.makeButton({
        x: startX,
        y,
        w,
        h,
        label: r.toString(),
        onClick: () => this.tryAdd(r),
      });

      // Image slice thumbnail to the LEFT of the button
      const thumbRadius = 28;
      const thumb = this.makeSliceThumbnail(
        r,
        { x: startX - (thumbRadius * 2 + 18), y: y + (h - thumbRadius * 2) / 2 },
        thumbRadius,
      );

      this.uiGroup.add(thumb, btn);
    });
  }

  private makeSliceThumbnail(
    r: Rational,
    pos: { x: number; y: number },
    radius: number,
  ): Konva.Group {
    const g = new Konva.Group({ x: pos.x, y: pos.y, width: radius * 2, height: radius * 2 });

    // Clip a small wedge from the pizza image
    const start = -Math.PI / 2;
    const end = start + r.toNumber() * Math.PI * 2;

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
      // Fallback if image not ready (rare)
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

  private makeButton(opts: {
    x: number;
    y: number;
    w: number;
    h: number;
    label: string;
    onClick: () => void;
  }) {
    const g = new Konva.Group({ x: opts.x, y: opts.y });
    const rect = new Konva.Rect({
      width: opts.w,
      height: opts.h,
      cornerRadius: 12,
      fill: "#ffffff",
      stroke: "#94a3b8",
      strokeWidth: 2,
      shadowColor: "black",
      shadowOpacity: 0.08,
      shadowBlur: 8,
      shadowOffset: { x: 0, y: 2 },
    });
    const text = new Konva.Text({
      x: 0,
      y: 0,
      width: opts.w,
      height: opts.h,
      align: "center",
      verticalAlign: "middle",
      text: opts.label,
      fontSize: 22,
      fontFamily: "Arial",
      fill: "#0f172a",
    });
    g.add(rect, text);

    g.on("mouseenter", () => {
      rect.fill("#f1f5f9");
      const stage = g.getStage();
      if (stage) stage.container().style.cursor = "pointer";
      this.group.getLayer()?.batchDraw();
    });
    g.on("mouseleave", () => {
      rect.fill("#ffffff");
      const stage = g.getStage();
      if (stage) stage.container().style.cursor = "default";
      this.group.getLayer()?.batchDraw();
    });
    g.on("click touchstart", opts.onClick);

    return g;
  }

  // ---------------- Game logic ----------------
  private resetGame() {
    this.current = Rational.zero();
    this.sumText.text(`Current: 0/1`);
    this.statusText.text("Click a fraction to add a slice");

    // Remove previous wedges
    this.pizzaGroup
      .getChildren((n) => n.getAttr("data-wedge") === true)
      .forEach((n) => n.destroy());
    this.group.getLayer()?.draw();
  }

  private tryAdd(r: Rational) {
    const next = this.current.add(r);
    if (next.gt(Rational.one().add(this.epsilon))) {
      this.statusText.text("That would overflow the pizza. Try a smaller slice.");
      this.group.getLayer()?.batchDraw();
      return;
    }

    this.addImageSlice(r);
    this.current = next;
    this.sumText.text(`Current: ${this.current.toString()}`);

    if (this.current.closeTo(Rational.one(), this.epsilon)) {
      this.current = Rational.one();
      this.sumText.text("Current: 1/1");
      this.statusText.text("Perfect! Pizza completed!");
    } else {
      const remaining = Rational.one().sub(this.current).clampMinZero();
      this.statusText.text(`Added ${r.toString()}. Remaining: ${remaining.toString()}`);
    }

    this.group.getLayer()?.batchDraw();
  }

  private addImageSlice(r: Rational) {
    if (!this.pizzaHTMLImage) return;

    const filled = this.current.toNumber();
    const add = r.toNumber();
    const start = -Math.PI / 2 + filled * Math.PI * 2;
    const end = start + add * Math.PI * 2;

    const d = this.pizzaRadius * 2 - 36;
    const g = new Konva.Group({ x: this.pizzaCenter.x - d / 2, y: this.pizzaCenter.y - d / 2 });

    g.clipFunc((ctx) => {
      ctx.beginPath();
      ctx.moveTo(d / 2, d / 2);
      ctx.arc(d / 2, d / 2, d / 2, start, end, false);
      ctx.closePath();
    });

    g.add(new Konva.Image({ image: this.pizzaHTMLImage, x: 0, y: 0, width: d, height: d }));
    g.setAttr("data-wedge", true);
    this.pizzaGroup.add(g);
  }
}

export default Minigame1ScreenView;
