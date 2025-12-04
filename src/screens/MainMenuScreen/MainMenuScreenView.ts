/**
 * WILL BE COPYING IDEAS AND LAYOUTS FROM LAB
 * AND BUILDING UPON IT
 */
import Konva from "konva";

import { ButtonFactory } from "../../util/ButtonFactory.ts";

import type { View } from "../../types.ts";

export class MainMenuScreenView implements View {
  private readonly group: Konva.Group;
  private readonly difficultyNodes: Konva.Text[] = [];

  constructor(
    onStartClick: () => void,
    onHelpClick: () => void,
    onDifficultySelect: (level: string) => void,
  ) {
    this.group = new Konva.Group({ visible: true });

    const width = window.innerWidth;
    const height = window.innerHeight;

    // logo instead of text
    const img = new Image();
    img.onload = () => {
      const logoWidth = Math.min(400, width * 0.6);
      const logoHeight = (img.height / img.width) * logoWidth;
      const logo = new Konva.Image({
        image: img,
        x: width / 2,
        y: height / 4,
        width: logoWidth,
        height: logoHeight,
      });
      logo.offsetX(logoWidth / 2);
      logo.offsetY(logoHeight / 2);
      this.group.add(logo);
      this.group.getLayer()?.draw();
    };
    img.src = "/new logo fraction mania.png";

    //-----------------------------Difficulty Bar Section-------------------------------------------------------------------
    // defining values that are necessary for the difficulty selector
    const difficulties = ["Easy", "Medium", "Hard"];

    // creating a group that displays difficulties
    const difficultyGroup = new Konva.Group({
      // placing selector in the middle, right above the start button
      x: width / 2,
      y: 2.5 * (height / 5),
    });

    // creating the level labels
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

    // Start Button (with button factory now)
    const startButtonFactory = ButtonFactory.construct()
      .pos(width / 2, 3 * (height / 5) + 20 + 30)
      .text("START GAME")
      .width(200)
      .height(60)
      .fontSize(24)
      .backColor("#df1e19")
      .onClick(onStartClick)
      .build(); // Creates the final Konva.Group

    this.group.add(startButtonFactory);

    // Help Button (with button factory now)
    const helpButtonFactory = ButtonFactory.construct()
      .pos(width / 2, 4 * (height / 5) + 30)
      .text("HELP")
      .width(200)
      .height(60)
      .fontSize(24)
      .backColor("#df1e19")
      .onClick(onHelpClick)
      .build();

    this.group.add(helpButtonFactory);
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

export default MainMenuScreenView;
