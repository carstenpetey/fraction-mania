// THIS FILE WILL RENDER THE GAME'S BACKGROUND
import Konva from "konva";

// need these to define dimensions
import { STAGE_HEIGHT, STAGE_WIDTH } from "../../../constants";

/**
 * class that creates the background for the game
 */
export class BackgroundRenderer {
  /**
   * creates background of game
   * @returns Konva.Group containing the background AND stars
   */
  public static createBackground(): Konva.Group {
    const group = new Konva.Group();

    // --- BACKGROUND RECT ---
    const background = new Konva.Rect({
      x: 0,
      y: 0,
      width: STAGE_WIDTH,
      height: STAGE_HEIGHT,
      fill: "#0A0A20",
      listening: false,
    });

    // adding background to the group
    group.add(background);

    // --- STARS ---
    const stars = BackgroundRenderer.createStars(200, STAGE_WIDTH, STAGE_HEIGHT);
    stars.forEach((s) => group.add(s));

    return group;
  }

  /**
   * generate random start
   * @param count the number of stars we will create
   * @param height the height of the background
   * @param width the width of the background
   * @returns an array of circles that represents stars
   */
  private static createStars(count: number, width: number, height: number): Konva.Circle[] {
    // creating list of stars
    const stars: Konva.Circle[] = [];

    // creating each start iteratively
    for (let i = 0; i < count; i++) {
      // star will be between 1px and 3px
      const size = Math.random() * 2 + 1;

      // opacity is also random (adds depth as some stars are brighter than others)
      const opacity = Math.random() * 0.7 + 0.3;

      // defining the star
      const star = new Konva.Circle({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: size,
        fill: "white",
        opacity,
        listening: false,
      });

      // adding to list
      stars.push(star);
    }

    // return
    return stars;
  }
}
