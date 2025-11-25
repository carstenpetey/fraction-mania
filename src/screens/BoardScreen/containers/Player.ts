import type { Tile } from "./Tile";

export class Player {
  id: string;
  currentTile: Tile;

  constructor(id: string, startTile: Tile) {
    this.id = id;
    this.currentTile = startTile;
  }

  /*
   * Move the player to next avaliable tile (clockwise branch priority).
   */
  public move(): void {
    const { north, east, south } = this.currentTile.nextTile;
    this.currentTile = north ?? east ?? south ?? this.currentTile;
  }

  /*
   * Returns current tile.
   */
  public getCurrentTile(): Tile {
    return this.currentTile;
  }

  /*
   * Chech if player has reached the end tile.
   */
  public isAtEnd(): boolean {
    return this.currentTile.type.type === "end";
  }
}
