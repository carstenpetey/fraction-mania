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

  /*
   * Checks if player is ahead of given entity on board.
   * @param entity - entity to check for
   */
  public isAheadOf(entity: Player): boolean {
    let ctile: Tile | null = this.currentTile;
    while (ctile != null) {
      if (ctile === entity.currentTile) {
        return true;
      }
      ctile = ctile.nextTile.north ?? ctile.nextTile.east ?? ctile.nextTile.south ?? null;
    }
    return false;
  }
}
