import { Tile, type TileSuccessors, type TileType } from "../containers/Tile";

/*
 * Class containing Generator for the BoardScreenModel
 */
export class BoardGenerator {
  private readonly minigameChance: number;
  private readonly branchChance: number;

  constructor(minigameChance: number, branchChance: number) {
    this.minigameChance = minigameChance;
    this.branchChance = branchChance;
  }

  public generateLineBoard(n: number): { start: Tile; minigame: Tile } {
    const endTile = new Tile(`t_end`, { type: "end" }, { north: null, east: null, south: null });
    let firstMinigame = endTile;
    let next = endTile;

    for (let i = n - 1; i >= 1; i--) {
      const isMinigame = Math.random() < this.minigameChance;

      const type: TileType = isMinigame ? { type: "minigame" } : { type: "normal" };

      const successors: TileSuccessors = { north: null, east: null, south: null };

      const randBranch = Math.random();
      if (randBranch < this.branchChance) {
        successors.north = next;
      } else if (randBranch > 1 - this.branchChance) {
        successors.south = next;
      } else {
        successors.east = next;
      }

      const tile = new Tile(`t_${i}`, type, successors);
      next = tile;

      if (isMinigame) {
        firstMinigame = next;
      }
    }

    return { start: next, minigame: firstMinigame };
  }
}
