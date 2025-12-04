import Konva from "konva";

import { BoardLayout } from "../containers/BoardLayout";

import type { Player } from "../containers/Player";
import type { Tile } from "../containers/Tile";

/*
 * Class containing Render for the board.
 */
export class BoardRenderer {
  // Size of each individual tile
  private readonly tileSize = 120;
  private readonly strokeWidth = 10;
  private readonly tileOffset = this.tileSize + this.strokeWidth / 2 + 10;

  private readonly group: Konva.Group;
  private readonly width: number;
  private readonly height: number;

  private readonly boardLayout: BoardLayout;

  public readonly renderedTileMap = new Map<Tile, Konva.Group>();
  public readonly renderedPlayer = new Konva.Group();
  public readonly renderedMonster = new Konva.Group();

  private cameraTween: Konva.Tween | null = null;

  constructor(group: Konva.Group, width: number, heigth: number) {
    this.group = group;
    this.width = width;
    this.height = heigth;

    this.boardLayout = new BoardLayout(this.tileOffset);
  }

  /*
   * Updates player position, based on the current tile
   * @param tile - players current tile
   */
  public async updatePlayer(tile: Tile): Promise<void> {
    const playerPos = this.boardLayout.getPosition(tile) ?? { x: 0, y: 0 };

    const playerTween = new Konva.Tween({
      node: this.renderedPlayer,
      duration: 0.4,
      x: playerPos.x,
      y: playerPos.y,
      easing: Konva.Easings.EaseInOut.bind(Konva.Easings),
      onFinish: () => {
        playerTween.destroy();
      },
    });

    playerTween.play();
    await this.centerCameraOnPlayer(tile, null);
  }

  /*
   * Updates monster position, based on the current tile
   * @param tile - monster current tile
   */
  public async updateMonster(tile: Tile): Promise<void> {
    return new Promise((resolve) => {
      const mosnterPos = this.boardLayout.getPosition(tile) ?? { x: 0, y: 0 };

      const monsterTween = new Konva.Tween({
        node: this.renderedMonster,
        duration: 0.8,
        x: mosnterPos.x,
        easing: Konva.Easings.EaseInOut.bind(Konva.Easings),
        onFinish: () => {
          monsterTween.destroy();
          resolve();
        },
      });

      monsterTween.play();
    });
  }

  /*
   * Moves board layer to simulat camera movement.
   * @param tile - players current tile
   */
  public async centerCameraOnPlayer(
    tile: Tile,
    mousePos: { x: number; y: number } | null,
  ): Promise<void> {
    return new Promise((resolve) => {
      const playerPos = this.boardLayout.getPosition(tile) ?? { x: 0, y: 0 };

      let panOffsetX = 0;
      let panOffsetY = 0;

      if (mousePos) {
        const offsetXNorm = (mousePos.x - this.width / 2) / (this.width / 2);
        const offsetYNorm = (mousePos.y - this.height / 2) / (this.height / 2);

        const maxPanOffset = 200;

        panOffsetX = offsetXNorm * maxPanOffset;
        panOffsetY = offsetYNorm * maxPanOffset;
      }

      const targetX = -playerPos.x - panOffsetX;
      const targetY = -playerPos.y - panOffsetY;

      if (this.cameraTween) {
        this.cameraTween.pause();
        this.cameraTween = null;
      }

      this.cameraTween = new Konva.Tween({
        node: this.group,
        duration: 0.5,
        x: targetX,
        y: targetY,
        easing: Konva.Easings.EaseInOut.bind(Konva.Easings),
        onFinish: () => {
          this.cameraTween?.destroy();
          resolve();
        },
      });

      this.cameraTween.play();
    });
  }

  /*
   * Scale board layer to simulat camera zoom.
   * @param tile - center of zoom focus.
   * @param factor - zoom factor.
   * @param duration - time of a zoom action.
   */
  public async updateCameraZoom(tile: Tile, factor: number, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const playerPos = this.boardLayout.getPosition(tile) ?? { x: 0, y: 0 };
      this.group.offset(playerPos);
      const zoomOutTween = new Konva.Tween({
        node: this.group,
        duration,
        scaleX: factor,
        scaleY: factor,
        easing: Konva.Easings.EaseInOut.bind(Konva.Easings),
        onFinish: () => {
          zoomOutTween.destroy();
          resolve();
        },
      });
      zoomOutTween.play();
      this.group.offset({ x: 0, y: 0 });
    });
  }

  public async fadeBoard(factor: number, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const fadeTweem = new Konva.Tween({
        node: this.group,
        duration,
        opacity: factor,
        easing: Konva.Easings.EaseInOut.bind(Konva.Easings),
        onFinish: () => {
          fadeTweem.destroy();
          resolve();
        },
      });
      fadeTweem.play();
    });
  }

  /*
   * Draws all the Tiles and player on it.
   * @param startTile - origin tile to draw the board from
   */
  public drawBoard(startTile: Tile) {
    this.boardLayout.computePositions(startTile);
    this.boardLayout.getAllPositions().forEach(({ x, y }, tile) => this.drawTile(tile, x, y));
  }

  /*
   * Draws a player on a board.
   * @param player - player object to be rendered
   */
  public drawPlayer(player: Player) {
    const pos = this.boardLayout.getPosition(player.currentTile);
    if (!pos) return;

    const elementBox = new Konva.Circle({
      x: this.width / 2 + pos.x,
      y: this.height / 2 + pos.y,
      width: this.tileSize,
      height: this.tileSize,
      fill: "yellow",
      cornerRadius: 2,
      stroke: "black",
      strokeWidth: this.strokeWidth,
    });

    this.renderedPlayer.add(elementBox);
  }

  /*
   * Draws a monster on a board.
   * @param monster - monster object to be rendered
   */
  public drawMonster(monster: Player) {
    const pos = this.boardLayout.getPosition(monster.currentTile);
    if (!pos) return;

    const elementBox = new Konva.Rect({
      x: this.width / 2 + pos.x,
      y: -this.height / 2,
      width: -this.width,
      height: this.height * 2,
      fill: "black",
      stroke: "black",
      strokeWidth: this.strokeWidth,
    });
    const elementText = new Konva.Text({
      x: this.width * 0.25,
      y: this.height / 2,
      text: "This is monster",
      fontSize: 48,
      fontFamily: "Arial",
      fill: "white",
      align: "center",
    });

    this.renderedMonster.add(elementBox);
    this.renderedMonster.add(elementText);
  }

  /*
   * Draws the Tile at specified coordinates.
   * @param tile - tile to be rendered
   * @param dx, dy - relative coordinates to render the tile from.
   */
  private drawTile(tile: Tile, dx: number, dy: number): void {
    // Avoid redrawing the same tiles twice
    if (this.renderedTileMap.has(tile)) {
      return;
    }

    // Selection of renders for different tiles types
    switch (tile.type.type) {
      case "end":
        this.drawEndTile(tile, dx, dy);
        break;
      case "minigame":
        this.drawMinigameTile(tile, dx, dy, "#F09090");
        break;
      default:
        this.drawNormalTile(tile, dx, dy);
    }
  }

  /*
   * Renders End tile
   * @param tile - associated tile to render
   * @param dx, dy - origin of render
   */
  private drawEndTile(tile: Tile, dx: number, dy: number): void {
    const tileElement = new Konva.Group();
    const elementBox = new Konva.Rect({
      x: this.width / 2 - this.tileSize / 2 + dx,
      y: this.height / 2 - this.tileSize / 2 + dy,
      width: this.tileSize,
      height: this.tileSize,
      fill: "black",
      cornerRadius: 2,
      stroke: "black",
      strokeWidth: this.strokeWidth,
    });
    tileElement.add(elementBox);
    this.renderedTileMap.set(tile, tileElement);
  }

  /*
   * Renders Minigame tile
   * @param tile - associated tile to render
   * @param dx, dy - origin of render
   */
  private drawMinigameTile(tile: Tile, dx: number, dy: number, color: string): void {
    const tileElement = new Konva.Group();
    const elementBox = new Konva.Rect({
      x: this.width / 2 - this.tileSize / 2 + dx,
      y: this.height / 2 - this.tileSize / 2 + dy,
      width: this.tileSize,
      height: this.tileSize,
      fill: color,
      cornerRadius: 2,
      stroke: "black",
      strokeWidth: this.strokeWidth,
    });
    tileElement.add(elementBox);
    this.renderedTileMap.set(tile, tileElement);
  }

  /*
   * Renders Normal tile
   * @param tile - associated tile to render
   * @param dx, dy - origin of render
   */
  private drawNormalTile(tile: Tile, dx: number, dy: number): void {
    const tileElement = new Konva.Group();
    const elementBox = new Konva.Rect({
      x: this.width / 2 - this.tileSize / 2 + dx,
      y: this.height / 2 - this.tileSize / 2 + dy,
      width: this.tileSize,
      height: this.tileSize,
      fill: "white",
      cornerRadius: 2,
      stroke: "black",
      strokeWidth: this.strokeWidth,
    });
    tileElement.add(elementBox);
    this.renderedTileMap.set(tile, tileElement);
  }
}
