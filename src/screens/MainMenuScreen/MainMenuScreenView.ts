/**
 * WILL BE COPYING IDEAS AND LAYOUTS FROM LAB
 * AND BUILDING UPON IT
 */
import Konva from "konva";
import type { View } from "../../types.ts";

export class MainMenuScreenView implements View {
  private readonly group: Konva.Group;
  private readonly difficultyNodes: Konva.Text[] = [];

  constructor(
    onStartClick: () => void,
    onHelpClick: () => void,
    onDifficultySelect: (level: string) => void,
    onMinigameClick: () => void,
  ) {
    this.group = new Konva.Group({ visible: true });

    const width = window.innerWidth;
    const height = window.innerHeight;

    // Title
    const title = new Konva.Text({
      x: width / 2,
      y: height / 5,
      text: "Fraction Mania",
      fontSize: 90,
      fontFamily: "Arial",
      fill: "gray",
      stroke: "black",
      strokeWidth: 3,
      align: "center",
      fontStyle: "bold",
    });
    title.offsetX(title.width() / 2);
    this.group.add(title);

    // Difficulty selector
    const difficulties = ["EASY", "MEDIUM", "HARD"];
    const difficultyGroup = new Konva.Group({ x: width / 2, y: 2.5 * (height / 5) });
    let currentX = 0;
    const spacing = 40;

    difficulties.forEach((level, index) => {
      const difficultyOptions = new Konva.Text({
        text: level,
        fontSize: 30,
        fontFamily: "Arial",
        fill: index === 0 ? "black" : "gray",
        fontStyle: index === 0 ? "bold" : "normal",
        opacity: index === 0 ? 1 : 0.6,
        name: "difficulty-option",
        id: level.toLowerCase(),
      });
      difficultyOptions.x(currentX);
      currentX += difficultyOptions.width() + spacing;
      difficultyOptions.on("click", () => onDifficultySelect(level));
      this.difficultyNodes.push(difficultyOptions);
      difficultyGroup.add(difficultyOptions);
    });
    difficultyGroup.offsetX(currentX / 2);
    this.group.add(difficultyGroup);

    // Start Button (center)
    const startButtonGroup = new Konva.Group();
    const startButton = new Konva.Rect({ x: width / 2, y: 3 * (height / 5) + 20, width: 200, height: 60, fill: "gray", cornerRadius: 10, stroke: "black", strokeWidth: 2 });
    const startText = new Konva.Text({ x: width / 2, y: 3 * (height / 5) + 38, text: "START GAME", fontSize: 24, fontFamily: "Arial", fill: "white", align: "center" });
    startButton.offsetX(startButton.width() / 2);
    startText.offsetX(startText.width() / 2);
    startButtonGroup.add(startButton, startText);
    startButtonGroup.on("click", onStartClick);
    this.group.add(startButtonGroup);

    // Play Minigame Button (moved farther right)
    const miniButtonGroup = new Konva.Group();
    const miniButton = new Konva.Rect({ x: width / 2 + 300, y: 3.65 * (height / 5), width: 220, height: 60, fill: "gray", cornerRadius: 10, stroke: "black", strokeWidth: 2 });
    const miniText = new Konva.Text({ x: width / 2 + 300, y: 3.65 * (height / 5) + 18, text: "PLAY MINIGAME", fontSize: 24, fontFamily: "Arial", fill: "white", align: "center" });
    miniButton.offsetX(miniButton.width() / 2);
    miniText.offsetX(miniText.width() / 2);
    miniButtonGroup.add(miniButton, miniText);
    miniButtonGroup.on("click", onMinigameClick);
    this.group.add(miniButtonGroup);

    // Help Button (below)
    const helpButtonGroup = new Konva.Group();
    const helpButton = new Konva.Rect({ x: width / 2, y: 4 * (height / 5), width: 200, height: 60, fill: "gray", cornerRadius: 10, stroke: "black", strokeWidth: 2 });
    const helpText = new Konva.Text({ x: width / 2, y: 4 * (height / 5) + 18, text: "HELP", fontSize: 24, fontFamily: "Arial", fill: "white", align: "center" });
    helpButton.offsetX(helpButton.width() / 2);
    helpText.offsetX(helpText.width() / 2);
    helpButtonGroup.add(helpButton, helpText);
    helpButtonGroup.on("click", onHelpClick);
    this.group.add(helpButtonGroup);
  }

  public updateDifficultyDisplay(selectedLevel: string): void {
    this.difficultyNodes.forEach((node) => {
      const level = node.text();
      if (level === selectedLevel) {
        node.fontStyle("bold");
        node.fill("black");
        node.opacity(1);
      } else {
        node.fontStyle("normal");
        node.fill("gray");
        node.opacity(0.6);
      }
    });
    this.group.getLayer()?.draw();
  }

  show(): void { this.group.visible(true); this.group.getLayer()?.draw(); }
  hide(): void { this.group.visible(false); this.group.getLayer()?.draw(); }
  getGroup(): Konva.Group { return this.group; }
}

export default MainMenuScreenView;