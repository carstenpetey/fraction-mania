// getting needed imports
import Konva from "konva";

import { STAGE_HEIGHT, STAGE_WIDTH } from "../../constants.ts";
import { ButtonFactory } from "../../util/ButtonFactory.ts";

import type { View } from "../../types.ts";

// defining function that will be implemented later. This function will be necessary to play certain videos depending on the button that is pressed.
type OnVideoSelect = (url: string) => void;

// links to videos to help teach arithmetic (from Khan Academy)
export const topics = [
  { operation: "+", title: "Adding Fractions", url: "https://www.youtube.com/watch?v=bcCLKACsYJ0" },
  {
    operation: "-",
    title: "Subtracting Fractions",
    url: "https://www.youtube.com/watch?v=2DPivVFCdqA",
  },
  {
    operation: "*",
    title: "Multiplying Fractions",
    url: "https://www.youtube.com/watch?v=x6xtezhuCZ4",
  },
  {
    operation: "/",
    title: "Dividing Fractions",
    url: "https://www.youtube.com/watch?v=f3ySpxX9oeM",
  },
];

// defining the view for the help screen
export class EquationHelpScreenView implements View {
  private readonly group: Konva.Group;

  // defining HTML element so we can embed the YouTube videos
  private videoContainer: HTMLDivElement | null = null;

  // this layer is important later. This layer is what appears when an embedded video is playing. This layer is needed so that users can stop watching the video
  // specifically when a video is playing. IN SIMPLE TERMS, while video playing, we need a button to exit video viewing frame. If video is not playing, button should
  // not be there.
  private closeLayer: Konva.Layer | null = null;

  // this is the group of buttons. We need this because when video is playing, we want to hide the buttons. Otherwise, we want the buttons to be seen.
  private backButtonGroup: Konva.Group | null = null;

  // constructor for the view. We need to define what we do when back is clicked and when video button is clicked.
  constructor(onVideoSelect: OnVideoSelect, onBackClick: () => void) {
    this.group = new Konva.Group({ visible: false });

    // creating buttons so user can select what they need help with
    this.createTitle();
    this.createHelpButtons(onVideoSelect);

    // back button to return to the screen
    this.createBackButton(onBackClick);
  }

  // title for the page. Just meant to let user know this is the help page
  private createTitle(): void {
    // defining title appropriately
    const title = new Konva.Text({
      x: STAGE_WIDTH / 2,
      y: STAGE_HEIGHT / 8,
      text: "Fraction Help Topics",
      fontSize: 40,
      fontFamily: "Arial",
      fill: "black",
    });

    // offsetting so title is centered
    title.offsetX(title.width() / 2);
    this.group.add(title);
  }

  // creating buttons for each operation. should be 4 total
  private createHelpButtons(onVideoSelect: OnVideoSelect): void {
    // --- Define Constants for Button Dimensions ---
    const BUTTON_WIDTH = 280;
    const BUTTON_HEIGHT = 60;
    const GAP = 25;
    const HEADER_OFFSET = 50;

    // calculate the initial Y position
    const totalHeight = topics.length * BUTTON_HEIGHT + (topics.length - 1) * GAP;
    let currentYTopEdge = (STAGE_HEIGHT - totalHeight) / 2 - HEADER_OFFSET;

    // define the button center X coordinate
    const buttonCenterX = STAGE_WIDTH / 2;

    // ceate group of buttons for each topic
    topics.forEach((topic) => {
      // calculate the center Y coordinate for the factory
      const buttonCenterY = currentYTopEdge + BUTTON_HEIGHT / 2;

      // use button factory to create buttons
      const buttonGroup = ButtonFactory.construct()
        .pos(buttonCenterX, buttonCenterY)
        .text(topic.title)
        .width(BUTTON_WIDTH)
        .height(BUTTON_HEIGHT)
        .fontSize(24)

        // applying color theme
        .backColor("#df1e19")
        .hoverColor("black")

        // attach handler
        .onClick(() => onVideoSelect(topic.url))
        .build();

      // add buttons to group
      this.group.add(buttonGroup);

      // add gap between buttons
      currentYTopEdge += BUTTON_HEIGHT + GAP;
    });
  }

  // creating back button so user can go back to solving the equation
  private createBackButton(onBackClick: () => void): void {
    // defining constats
    const BUTTON_WIDTH = 120;
    const BUTTON_HEIGHT = 40;
    const Y_OFFSET_FROM_BOTTOM = 100;

    // calculating position
    const buttonCenterX = STAGE_WIDTH / 2;
    const buttonCenterY = STAGE_HEIGHT - Y_OFFSET_FROM_BOTTOM + BUTTON_HEIGHT / 2;

    // construct using button factory
    const buttonGroup = ButtonFactory.construct()
      .pos(buttonCenterX, buttonCenterY)
      .text("BACK")
      .width(BUTTON_WIDTH)
      .height(BUTTON_HEIGHT)
      .fontSize(20)
      .backColor("black")
      .hoverColor("#df1e19")
      .onClick(onBackClick)
      .build();

    // add button to group
    this.group.add(buttonGroup);

    // add to all buttons
    this.backButtonGroup = buttonGroup;
  }

  // embedding videos. AKA, when user presses a topic button, a video appears
  public showVideoEmbed(url: string): void {
    // use embed URL format for IFRAME
    const videoUrl = url.replace("watch?v=", "embed/");

    // determining how the video will be displayed on the screen
    const videoWidth = 800;
    const videoHeight = 450;
    const appContainer = document.getElementById("app");

    if (!appContainer) return;

    // dimming buttons in the background
    this.group.opacity(0.1);

    // this is what we initialized in the constructor. The goal is to only have functionality for the close video button while video is playing.
    // since back button would be visible, we remove its visibility so users don't get confused.
    if (this.backButtonGroup) {
      this.backButtonGroup.visible(false);
    }

    // redraw the canvas
    this.group.getLayer()?.draw();

    // creating video container if it doesn't alredy exist
    // create a temporary div so that we can display the video properly
    if (!this.videoContainer) {
      this.videoContainer = document.createElement("div");
      this.videoContainer.id = "video-embed-container";
      this.videoContainer.style.position = "absolute";
      this.videoContainer.style.zIndex = "100";
      appContainer.appendChild(this.videoContainer);
    }

    // cetnering the video
    const left = (window.innerWidth - videoWidth) / 2;
    const top = (window.innerHeight - videoHeight) / 2;

    // styling div. aka, just getting right dimensions
    this.videoContainer.style.width = `${videoWidth}px`;
    this.videoContainer.style.height = `${videoHeight}px`;
    this.videoContainer.style.left = `${left}px`;
    this.videoContainer.style.top = `${top}px`;

    // using HTML to embed the video
    this.videoContainer.innerHTML = `
            <iframe 
                width="${videoWidth}" 
                height="${videoHeight}" 
                src="${videoUrl}?autoplay=1&rel=0" 
                frameborder="0" 
                allow="autoplay; encrypted-media" 
                allowfullscreen
            ></iframe>`;

    this.videoContainer.style.display = "block";

    // creating the close button, so that users can stop watching video as they wish
    this.createCloseButton();

    // find the stage and add the new layer
    const stage = this.group.getStage();
    if (this.closeLayer && stage) {
      stage.add(this.closeLayer);
      this.closeLayer.draw();
    }
  }

  // function that is meant to close video and return back to menu functions
  public hideVideoEmbed(): void {
    // hiding the temporary div container created when embedding the video
    if (this.videoContainer) {
      this.videoContainer.style.display = "none";
      this.videoContainer.innerHTML = "";
    }

    // removing the close button, as it is only needed when the video is playing.
    // this is why we defined closeLayer in the constructor for the view
    if (this.closeLayer) {
      this.closeLayer.destroy();
      this.closeLayer = null;
    }

    // restore opacity so the buttons look normal again
    this.group.opacity(1);

    // putting the back button again so that users can click it freely
    if (this.backButtonGroup) {
      this.backButtonGroup.visible(true);
    }

    // redrawing the canvas
    this.group.getLayer()?.draw();
  }

  // this is where we create the close video button so users can exit out of watching a video
  private createCloseButton(): void {
    // checking the closeLayer has already been initialized
    if (this.closeLayer) return;

    const buttonGroup = new Konva.Group();

    // determining button size
    const yPos = (window.innerHeight + 450) / 2 + 50;
    const width = 180;
    const height = 40;

    // designing the button itself
    const rect = new Konva.Rect({
      x: STAGE_WIDTH / 2 - width / 2,
      y: yPos,
      width,
      height,
      fill: "#fd0404ff",
      stroke: "black",
      cornerRadius: 5,
    });

    // text that indicates the button will close the video
    const text = new Konva.Text({
      x: STAGE_WIDTH / 2,
      y: yPos + 10,
      text: "CLOSE VIDEO",
      fontSize: 18,
      fill: "black",
    });
    text.offsetX(text.width() / 2);

    // adding button to the group
    buttonGroup.add(rect, text);

    // the button will call hideVideoEmbed, as that is what the purpose of the button is
    buttonGroup.on("click", () => this.hideVideoEmbed());

    // creating a new close layer
    const newCloseLayer = new Konva.Layer();
    newCloseLayer.add(buttonGroup);
    this.closeLayer = newCloseLayer;
  }

  // standard view functions
  show(): void {
    this.group.visible(true);
    this.group.getLayer()?.draw();
  }

  hide(): void {
    this.group.visible(false);
    this.hideVideoEmbed();
    this.group.getLayer()?.draw();
  }

  getGroup(): Konva.Group {
    return this.group;
  }
}
