// UI rendering/TimeRenderer.ts
import Konva from "konva";

// using width to implement horizontal progress bar
import { STAGE_WIDTH } from "../../../constants.ts";

// configuration for the spacechip (just the image)
type ShipTimerOptions = {
  timerShip: Konva.Image;
};

/**
 * this class is responsible for rendering the space ship progress bar
 */
export class ShipTimerRenderer {
  // container that holds the progress bar
  private readonly container: Konva.Group;

  // the image of the space ship
  private readonly timerShip: Konva.Image;

  // calculating the total width taken up
  private readonly totalWidth: number;

  // constructor given the image
  constructor(options: ShipTimerOptions) {
    // assigning the image
    this.timerShip = options.timerShip;

    // defining the progress bar container
    this.container = new Konva.Group({
      x: 0,
      y: 20,
    });

    // setup ship size
    this.timerShip.width(60);
    this.timerShip.height(30);
    this.timerShip.x(0);
    this.timerShip.y(-15);

    // calculate the distance the ship can travel (from one end of the screen to another)
    this.totalWidth = STAGE_WIDTH - 40 - this.timerShip.width();

    this.container.add(this.timerShip);

    // ensure we don't crash if the ship was already in a layer
    const layer = this.timerShip.getLayer();
    if (layer) {
      this.timerShip.moveTo(this.container);
    }
  }

  /**
   * updating the position of the ship given a percentage of the time that has passed
   */
  public updatePosition(percentage: number): void {
    // clamp percentage between 0 and 1
    const clamped = Math.max(0, Math.min(1, percentage));

    // move x according to the percentage
    this.timerShip.x(this.totalWidth * clamped);

    // redraw the layer
    this.container.getLayer()?.batchDraw();
  }

  /**
   * resetting the ships position
   */
  public reset(): void {
    // reset its position
    this.timerShip.x(0);
    this.container.getLayer()?.batchDraw();
  }

  /**
   * simple function to obtain the current progress bar
   * @returns the progress bar
   */
  public getNode(): Konva.Group {
    return this.container;
  }
}
