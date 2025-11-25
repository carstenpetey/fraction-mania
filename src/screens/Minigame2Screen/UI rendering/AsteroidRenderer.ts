// THIS FILE WILL RENDER THE ASTEROID GENERATION
import Konva from "konva";

import { STAGE_HEIGHT, STAGE_WIDTH } from "../../../constants";

import type { Fraction } from "../../../models/Fraction";

// type that is used to render the asteroids. every member variable will be needed in the creation
type AsteroidCreateOptions = {
  fractions: Fraction[];
  asteroidImage: Konva.Image;
  onFractionClick: (fraction: Fraction) => void;
  parentGroup: Konva.Group;
};

/**
 * handles creation, animation, and interactions for asteroids.
 */
export class AsteroidRenderer {
  /**
   * create all asteroid nodes and return a map based on fraction keys
   * @param options the type that will give us the necessary information to carry out rendering
   * @returns a map of fractions (asteroids)
   */
  static createAsteroids(options: AsteroidCreateOptions): Map<string, Konva.Group> {
    // extracting member variables
    const { fractions, asteroidImage, onFractionClick, parentGroup } = options;

    // map of nodes, where each entry is a fraction (as a string)
    const nodes = new Map<string, Konva.Group>();

    // defining our dimensions
    const stageWidth = STAGE_WIDTH;
    const stageHeight = STAGE_HEIGHT;
    const centerX = stageWidth / 2;
    const ASTEROID_SIZE = 250;

    // iterating through each of the fractions (asteroids)
    fractions.forEach((fraction, index) => {
      // defining our key
      const key = fraction.toString();

      // random positional layout
      const x = centerX + (Math.random() - 0.5) * 1200;
      const y = stageHeight / 5.5 + index * 160;

      // group containing rock + label
      const group = new Konva.Group({ x, y });

      // clone the asteroid image safely
      const rock = asteroidImage.clone({
        width: ASTEROID_SIZE,
        height: ASTEROID_SIZE,
        offsetX: ASTEROID_SIZE / 2,
        offsetY: ASTEROID_SIZE / 2,
      }) as Konva.Image;

      // fraction label
      const label = new Konva.Text({
        text: key,
        fontSize: 32,
        fill: "black",
        y: -10,
      });
      label.offsetX(label.width() / 2);

      // adding asteroid to the group
      group.add(rock, label);

      // click handler: animation + callback
      group.on("click tap", () => {
        AsteroidRenderer.runClickAnimation(group);
        onFractionClick(fraction);
      });

      // hover animations — cursor only applied to stage container
      group.on("mouseenter", () => {
        const container = group.getStage()?.container();
        if (container) container.style.cursor = "pointer";

        AsteroidRenderer.scaleTween(group, 1.12).play();
      });

      group.on("mouseleave", () => {
        const container = group.getStage()?.container();
        if (container) container.style.cursor = "default";

        AsteroidRenderer.scaleTween(group, 1).play();
      });

      // add animations
      AsteroidRenderer.addDriftAnimation(group);
      AsteroidRenderer.addRotationAnimation(rock);

      // adding the asteroids to the group
      parentGroup.add(group);
      nodes.set(key, group);
    });

    // returning the map
    return nodes;
  }

  // -------------------------------------------------
  //   Animation Utilities
  // -------------------------------------------------
  /**
   * scaling an asteroid property
   * @param node asteroid
   * @param scale how big we are going to scale
   * @returns new animation
   */
  private static scaleTween(node: Konva.Node, scale: number): Konva.Tween {
    return new Konva.Tween({
      node,
      scaleX: scale,
      scaleY: scale,
      duration: 0.15,
    });
  }

  /** simple click "pop" animation */
  static runClickAnimation(group: Konva.Group) {
    new Konva.Tween({
      node: group,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 0.12,
      onFinish: () => {
        AsteroidRenderer.scaleTween(group, 1).play();
      },
    }).play();
  }

  /** gentle drift motion for floating effect */
  static addDriftAnimation(group: Konva.Group) {
    const driftX = (Math.random() - 0.5) * 50;
    const driftY = (Math.random() - 0.5) * 50;

    new Konva.Tween({
      node: group,
      x: group.x() + driftX,
      y: group.y() + driftY,
      duration: 4 + Math.random() * 2,
      yoyo: true,
      repeat: Infinity,
    }).play();
  }

  /** rotation animation — unique per rock */
  static addRotationAnimation(rock: Konva.Image) {
    new Konva.Tween({
      node: rock,
      rotation: 10 + Math.random() * 20,
      duration: 5 + Math.random() * 2,
      yoyo: true,
      repeat: Infinity,
    }).play();
  }
}
