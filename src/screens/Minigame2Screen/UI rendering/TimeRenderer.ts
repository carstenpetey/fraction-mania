// THIS FILE RENDERS THE TIME COMPONENT OF THE MINIGAME (SPACESHIP PROGRESS BAR)
import Konva from "konva";

// importing dimensions
import { STAGE_WIDTH } from "../../../constants.ts";

// creating a type that stores the image of the ship and the duration of the timer
type ShipTimerOptions = {
  timerShip: Konva.Image;
  duration: number;
};

/**
 * handles the visual ship animation (timer) and triggers the onFinish handler.
 */
export class ShipTimerRenderer {
  // --- MEMBERS ---
  private readonly container: Konva.Group;
  private readonly timerShip: Konva.Image;
  private readonly duration: number;

  // animation
  private timerTween: Konva.Tween | null = null;

  // progress bar
  private readonly progress: Konva.Rect;

  constructor(options: ShipTimerOptions) {
    this.timerShip = options.timerShip;
    this.duration = options.duration;

    // --- holds ship and progress bar ---
    this.container = new Konva.Group({
      x: 0,
      y: 20,
    });

    // resize ship inside container
    this.timerShip.width(60);
    this.timerShip.height(30);
    this.timerShip.x(0);
    this.timerShip.y(-15);

    // --- progress bar ---
    this.progress = new Konva.Rect({
      x: 0,
      y: this.timerShip.height() / 2 - 3,
      width: STAGE_WIDTH - 40,
      height: 6,
      fill: "#555",
      cornerRadius: 3,
      opacity: 0.4,
    });

    // add to container
    this.container.add(this.progress);
    this.container.add(this.timerShip);

    // move container into the same layer as the ship (the ship is already added by the View)
    const layer = this.timerShip.getLayer();
    if (layer) {
      const parent = this.timerShip.getParent();
      if (parent) parent.add(this.container);
      this.timerShip.moveTo(this.container);
    }
  }

  /**
   * sets up the animation (spaceship flying across the screen)
   * @param onExpire handler that determines what happens when the timer expires
   */
  private setupTimerTween(onExpire: () => void): void {
    this.timerTween?.destroy();

    const targetX = this.progress.width() - this.timerShip.width();

    this.timerTween = new Konva.Tween({
      node: this.container,
      x: targetX,
      duration: this.duration,
      onFinish: () => onExpire(),
    });
  }

  /**
   * starting the timer
   */
  public start(onExpire: () => void): void {
    if (!this.timerTween) {
      this.setupTimerTween(onExpire);
    }
    this.timerTween?.play();
  }

  /**
   * stopping the timer
   */
  public stop(): void {
    this.timerTween?.pause();
  }

  /**
   * resetting container + ship
   */
  public reset(): void {
    this.stop();
    this.container.x(0);
    this.timerTween?.destroy();
    this.timerTween = null;
    this.container.getLayer()?.batchDraw();
  }

  /**
   * returns the container (not the ship alone)
   */
  public getNode(): Konva.Group {
    return this.container;
  }
}
