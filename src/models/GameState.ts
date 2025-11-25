export type Difficulty = "Easy" | "Medium" | "Hard";

export class GameState {
  private difficulty: Difficulty;

  /*
   * Constructor for class.
   */
  constructor() {
    this.difficulty = "Easy";
  }

  /*
   * Returns queston difficulty
   */
  public getDifficulty(): Difficulty {
    return this.difficulty;
  }

  /*
   * Sets queston difficulty
   */
  public setDifficulty(difficulty: Difficulty): void {
    this.difficulty = difficulty;
  }
}
