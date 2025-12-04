export type TileType = { type: "normal" } | { type: "minigame" } | { type: "end" };
export type TileSuccessors = { north: Tile | null; east: Tile | null; south: Tile | null };

export class Tile {
  id: string;
  type: TileType;
  nextTile: TileSuccessors;

  constructor(id: string, type: TileType, nextTile: TileSuccessors) {
    this.id = id;
    this.type = type;
    this.nextTile = nextTile;
  }

  isDeadEnd(): boolean {
    return !this.nextTile.north && !this.nextTile.east && !this.nextTile.south;
  }

  getType(): TileType {
    return this.type;
  }

  /*
   * Placeholder to avoid null entries.
   */
  public static getNullTile(): Tile {
    return new Tile("null", { type: "normal" }, { north: null, east: null, south: null });
  }
}
