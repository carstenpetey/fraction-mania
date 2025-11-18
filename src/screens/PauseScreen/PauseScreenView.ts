// screens/PauseScreen/PauseScreenView.ts
import Konva from "konva";

import type { View } from "../../types.ts";

/**
 * PauseScreenView - implements View
 * No constructor parameter properties (tsconfig: erasableSyntaxOnly).
 */
export class PauseScreenView implements View {
  private readonly group: Konva.Group;

  private readonly onResume: () => void;
  private readonly onHelp: () => void;
  private readonly onRestart: () => void;
  private readonly onQuit: () => void;

  constructor(onResume: () => void, onHelp: () => void, onRestart: () => void, onQuit: () => void) {
    this.onResume = onResume;
    this.onHelp = onHelp;
    this.onRestart = onRestart;
    this.onQuit = onQuit;

    this.group = new Konva.Group({ visible: false, listening: true });

    const width = window.innerWidth;
    const height = window.innerHeight;

    // ----------------------------- Title -----------------------------
    const title = new Konva.Text({
      x: width / 2,
      y: height / 5,
      text: "Paused",
      fontSize: 80,
      fontFamily: "Arial",
      fill: "gray",
      stroke: "black",
      strokeWidth: 3,
      align: "center",
      fontStyle: "bold",
    });
    title.offsetX(title.width() / 2);
    this.group.add(title);

    // ----------------------------- Buttons -----------------------------
    const buttons = [
      { label: "Resume", onClick: this.onResume },
      { label: "Help", onClick: this.onHelp },
      { label: "Restart", onClick: this.onRestart },
      { label: "Quit", onClick: this.onQuit },
    ] as const;

    const buttonWidth = 220;
    const buttonHeight = 60;
    const spacing = 20;
    const startY = height / 2.5;

    buttons.forEach((btn, i) => {
      const g = new Konva.Group({
        x: width / 2 - buttonWidth / 2,
        y: startY + i * (buttonHeight + spacing),
      });

      const rect = new Konva.Rect({
        width: buttonWidth,
        height: buttonHeight,
        fill: "gray",
        cornerRadius: 10,
        stroke: "black",
        strokeWidth: 2,
      });

      const text = new Konva.Text({
        x: 0,
        y: 0,
        width: buttonWidth,
        height: buttonHeight,
        text: btn.label,
        fontSize: 24,
        fontFamily: "Arial",
        fill: "white",
        align: "center",
        verticalAlign: "middle",
      });

      // hover
      g.on("mouseenter", () => {
        document.body.style.cursor = "pointer";
        rect.fill("darkgray");
        g.getLayer()?.draw();
      });
      g.on("mouseleave", () => {
        document.body.style.cursor = "default";
        rect.fill("gray");
        g.getLayer()?.draw();
      });
      // ignore this comment

      // click
      g.on("click", () => btn.onClick());

      g.add(rect);
      g.add(text);
      this.group.add(g);
    });
  }

  show(): void {
    this.group.visible(true);
    this.group.getLayer()?.draw();
  }

  hide(): void {
    this.group.visible(false);
    this.group.getLayer()?.draw();
  }

  getGroup(): Konva.Group {
    return this.group;
  }
}
