import Konva from "konva";

/*
 * Util Button Builder class for a simple construction of Konva Group for buttons.
 * Each parameter has a default, but if needed you can manually specify each of the following
 * To create desidred variant.
 *
 * Usage Example:
 *
 * const myButton = ButtonFactory.construct()
 *      .pos(this.width * 0.5, this.height * 0.1)
 *      .text("Call Saul")
 *      .onClick(() => console.log("calling..."))
 *      .build();
 *
 * Now just add myButton to your group and it's ready to use.
 */

export class ButtonFactory {
  private dx: number = 0;
  private dy: number = 0;
  private dw: number | null = null;
  private dh: number | null = null;
  private dtext: string = "Button";
  private dfont: number = 24;
  private dBBaseColor: string = "gray";
  private readonly dBHoverColor: string = "black";
  private donClick: (() => void) | null = null;

  static construct(): ButtonFactory {
    return new ButtonFactory();
  }

  /*
   * Position of a button on the screen.
   */
  pos(x: number, y: number): this {
    this.dx = x;
    this.dy = y;
    return this;
  }

  /*
   * Background width.
   */
  width(w: number): this {
    this.dw = w;
    return this;
  }

  /*
   * Background height.
   */
  height(h: number): this {
    this.dh = h;
    return this;
  }

  /*
   * Text to be displayed as button title.
   */
  text(t: string): this {
    this.dtext = t;
    return this;
  }

  /*
   * Sets font size
   */
  fontSize(s: number): this {
    this.dfont = s;
    return this;
  }

  /*
   *  On click action to be exectuted.
   */
  onClick(handler: () => void): this {
    this.donClick = handler;
    return this;
  }

  /*
   *  Button background color.
   */
  backColor(color: string): this {
    this.dBBaseColor = color;
    return this;
  }

  /*
   *  Button background color on hover.
   */
  hoverColor(color: string): this {
    this.dBBaseColor = color;
    return this;
  }

  /*
   * Constructs and returns the finihsed button group.
   */
  build(): Konva.Group {
    const button = new Konva.Group();

    const buttonText = new Konva.Text({
      text: this.dtext,
      fontSize: this.dfont,
      fontFamily: "Arial",
      fill: "white",
      align: "center",
    });

    const buttonBack = new Konva.Rect({
      width: this.dw ?? buttonText.width() + 20,
      height: this.dh ?? buttonText.height() + 20,
      fill: this.dBBaseColor,
      cornerRadius: 10,
      stroke: "black",
      strokeWidth: 2,
    });

    buttonBack.offsetX(buttonBack.width() / 2);
    buttonText.offsetX(buttonText.width() / 2);
    buttonBack.offsetY(buttonBack.height() / 2);
    buttonText.offsetY(buttonText.height() / 2);

    button.position({ x: this.dx, y: this.dy });
    button.add(buttonBack);
    button.add(buttonText);

    if (this.donClick) {
      button.on("click", this.donClick);
    }

    button.on("mouseenter", () => {
      buttonBack.fill(this.dBHoverColor);
      buttonBack.getLayer()?.batchDraw();
    });

    button.on("mouseleave", () => {
      buttonBack.fill(this.dBBaseColor);
      buttonBack.getLayer()?.batchDraw();
    });

    return button;
  }
}
