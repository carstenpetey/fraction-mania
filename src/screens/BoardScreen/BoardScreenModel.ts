import { DiceService } from "../../services/DiceService";

import { Player } from "./containers/Player";
import { Tile } from "./containers/Tile";
import { BoardGenerator } from "./utils/BoardGenerator";

import type { GameState } from "../../models/GameState";

export type BoardPhase = "roll" | "move";

export class BoardScreenModel {
  private readonly gameState: GameState;

  private player: Player = new Player("playboy", Tile.getNullTile());
  private monster: Player = new Player("jefry", Tile.getNullTile());
  private startingTile: Tile | null = null;
  private minigameTile: Tile | null = null;
  private phase: BoardPhase = "roll";
  private pendingRoll: number = 0;

  /*
   * Constructor for class and board generation.
   */
  constructor(gameState: GameState) {
    this.gameState = gameState;
    this.resetBoardModel();
  }

  /*
   * Changes current state
   */
  setPhase(phase: BoardPhase) {
    this.phase = phase;
  }

  /*
   * Roll a d6 dice.
   */
  roll() {
    this.pendingRoll = DiceService.rollDice(6);
  }

  /*
   * Get current pending roll value
   */
  getRoll(): number {
    return this.pendingRoll;
  }

  /*
   * Get current phase
   */
  getPhase(): BoardPhase {
    return this.phase;
  }

  /*
   * Deacteses roll value by 1
   */
  deacrementRoll() {
    if (this.gameState.getBonus() > 0) {
      this.gameState.addBonus(-1);
    } else {
      this.pendingRoll -= 1;
    }
  }

  /*
   * Returns player
   */
  getPlayer(): Player {
    return this.player;
  }

  /*
   * Returns monster
   */
  getMonster(): Player {
    return this.monster;
  }

  /*
   * Returns the starting tile, origin of board render and player position.
   */
  getStart(): Tile {
    return this.startingTile ?? Tile.getNullTile();
  }

  /*
   * Returns the first encountered Minigame Tile.
   */
  getFirstMinigame(): Tile {
    return this.minigameTile ?? Tile.getNullTile();
  }

  /*
   * Reset the board state
   */
  resetBoardModel(): void {
    const boardGen = new BoardGenerator(0.3, 0.08);

    const genData = boardGen.generateLineBoard(40);
    this.startingTile = genData.start;
    this.minigameTile = genData.minigame;
    this.player = new Player("playboy", this.startingTile);
    this.monster = new Player("jefry", this.startingTile);

    this.phase = "roll";
    this.pendingRoll = 0;
  }
}
