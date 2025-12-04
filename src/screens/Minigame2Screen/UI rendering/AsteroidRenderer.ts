// UI rendering/AsteroidRenderer.ts
import Konva from "konva";

// importing the window height and width for consistent dimensions across files
import { STAGE_HEIGHT, STAGE_WIDTH } from "../../../constants";

// importing the fraction model we created
import type { Fraction } from "../../../models/Fraction";

// importing a type that will be used to configure the renderer. all member variables will be used in asteroid construction
type AsteroidCreateOptions = {
  fractions: Fraction[];
  asteroidImage: Konva.Image;
  onFractionClick: (fraction: Fraction) => void;
  parentGroup: Konva.Group;
};

/**
 * this class is purely responsible for the visual aspect of the asteroids
 * this includes location randomization, png loading, and fraction generation
 */
export class AsteroidRenderer {
  /**
   * create all asteroid nodes and return a map based on fraction keys
   * the map is useful later on when we need to sort and determine which fraction comes next in order, as well as if a fraction actually exists
   */
  static createAsteroids(options: AsteroidCreateOptions): Map<string, Konva.Group> {
    // extracting the configuration variables
    const { fractions, asteroidImage, onFractionClick, parentGroup } = options;

    // creating new map to store fractions in (as strings)
    const nodes = new Map<string, Konva.Group>();

    // defining design parameters
    const centerX = STAGE_WIDTH / 2;
    const ASTEROID_SIZE = 250;

    // looping through each fraction in the array
    fractions.forEach((fraction, index) => {
      // map will use keys. key is fraction as a string
      const key = fraction.toString();

      // simulating a pseudorandom positional layout
      const x = centerX + (Math.random() - 0.5) * (STAGE_WIDTH * 0.8);
      const y = STAGE_HEIGHT / 5.5 + index * (STAGE_HEIGHT * 0.15);

      // creating new group
      const group = new Konva.Group({ x, y });

      // defining the dimensions of the asteroid itself
      const rock = asteroidImage.clone({
        width: ASTEROID_SIZE,
        height: ASTEROID_SIZE,
        offsetX: ASTEROID_SIZE / 2,
        offsetY: ASTEROID_SIZE / 2,
      }) as Konva.Image;

      // creating the label for the asteroid (the fraction that will go inside)
      const label = new Konva.Text({
        text: key,
        fontSize: 32,
        fill: "black",
        y: -10,
      });
      label.offsetX(label.width() / 2);

      // adding the asteroid with the fraction together
      group.add(rock, label);

      // click handler
      group.on("click tap", () => {
        AsteroidRenderer.runClickAnimation(group);
        onFractionClick(fraction);
      });

      // hover animations
      group.on("mouseenter", () => {
        const container = group.getStage()?.container();
        // changing the cursor style when hovering
        if (container) {
          container.style.cursor = "pointer";
        }
        // scaling when hovering
        AsteroidRenderer.scaleTween(group, 1.12)?.play();
      });

      group.on("mouseleave", () => {
        const container = group.getStage()?.container();
        // changing cursor back to default when leaving hover
        if (container) {
          container.style.cursor = "default";
        }
        // reverting scale back to default
        AsteroidRenderer.scaleTween(group, 1)?.play();
      });

      // adding asteroids to group and populating map
      parentGroup.add(group);
      nodes.set(key, group);

      // adding animations to the group
      AsteroidRenderer.addDriftAnimation(group);
      AsteroidRenderer.addRotationAnimation(rock);
    });

    return nodes;
  }

  // -------------------------------------------------
  //   Animation Utilities
  // -------------------------------------------------
  /**
   * scaling an asteroid property
   * @param node this represents the rock
   * @param scale this represents how large the scale will be (specifically for hovering)
   * @returns a new Konva animation
   */
  private static scaleTween(node: Konva.Node, scale: number): Konva.Tween | null {
    // if node is not in the layer, return null (edge case, should not happen realistically)
    if (!node.getLayer()) return null;

    // create a new animation
    return new Konva.Tween({
      node,
      scaleX: scale,
      scaleY: scale,
      duration: 0.15,
    });
  }

  /**
   * defining a click animation
   * @param group group of asteroids in which the behavior will be defined
   */
  static runClickAnimation(group: Konva.Group) {
    if (!group.getLayer()) return;

    // creating new animation on the group
    new Konva.Tween({
      node: group,
      scaleX: 1.15,
      scaleY: 1.15,
      duration: 0.12,
      onFinish: () => {
        // scale back when click finishes
        AsteroidRenderer.scaleTween(group, 1)?.play();
      },
    }).play();
  }

  /**
   * gentle drift motion with safety check
   * @param group performs the drifting animation on all rocks in the group
   */
  static addDriftAnimation(group: Konva.Group) {
    const startDrift = () => {
      // if the the asteroids are not on the layer, run a safety check
      if (!group.getLayer()) {
        requestAnimationFrame(startDrift);
        return;
      }

      // defining drift constants (random)
      const driftX = (Math.random() - 0.5) * 50;
      const driftY = (Math.random() - 0.5) * 50;

      // creaating the animation (floating sensation)
      new Konva.Tween({
        node: group,
        x: group.x() + driftX,
        y: group.y() + driftY,
        duration: 4 + Math.random() * 2,
        yoyo: true,
        repeat: Infinity,
      }).play();
    };

    startDrift();
  }

  /**
   * rotation animation with safety check
   * @param rock rotation will be applied to individual rock
   */
  static addRotationAnimation(rock: Konva.Image) {
    const startRotate = () => {
      // checking if the rock is on the screen
      if (!rock.getLayer()) {
        requestAnimationFrame(startRotate);
        return;
      }

      // rotating animation (spinning effect)
      new Konva.Tween({
        node: rock,
        rotation: 10 + Math.random() * 20,
        duration: 5 + Math.random() * 2,
        yoyo: true,
        repeat: Infinity,
      }).play();
    };

    startRotate();
  }
}
