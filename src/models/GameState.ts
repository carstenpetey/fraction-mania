export type Difficulty = "Easy" | "Medium" | "Hard";

export class GameState {
  private difficulty: Difficulty;
  private bonusRoll: number;
  private turnCounter: number;
  private passedQuestion: boolean;

  /*
   * Constructor for class.
   */
  constructor() {
    this.difficulty = "Easy";
    this.bonusRoll = 0;
    this.turnCounter = 0;
    this.passedQuestion = false;
  }

  /*
   * Get current bonus roll value.
   */
  public getBonus() {
    return this.bonusRoll;
  }

  /*
   * Add bonus to next roll value
   */
  public addBonus(bonus: number) {
    this.bonusRoll += bonus;
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

  /*
   * Get current turn count
   */
  public getTurnCount(): number {
    return this.turnCounter;
  }

  /*
   * Advance current turn by 1
   */
  public incrementTurn(): void {
    this.turnCounter += 1;
  }

  public hasPassedQuestion(): boolean {
    return this.passedQuestion;
  }

  public setPassedQuestion(passed: boolean): void {
    this.passedQuestion = passed;
  }

  /*
   * Resets all entries of the game state except of the selected difficulty.
   */
  public resetGameState(): void {
    this.bonusRoll = 0;
    this.turnCounter = 0;
    this.passedQuestion = false;
  }
}
