import { Fraction } from "../../models/Fraction.ts";
import { MinigameQuestionService } from "../../services/MinigameQuestionService.ts";
import { ScreenController } from "../../types.ts";

import { PizzaMinigameModel } from "./PizzaMinigameModel.ts";
import { PizzaMinigameView } from "./PizzaMinigameView.ts";

import type { ScreenSwitcher } from "../../types.ts";

export class PizzaMinigameController extends ScreenController {
  private readonly view: PizzaMinigameView;
  private readonly screenSwitcher: ScreenSwitcher;
  private readonly model: PizzaMinigameModel;

  private static readonly GAME_DURATION = 15;

  // timer state
  private timeRemaining: number = PizzaMinigameController.GAME_DURATION;
  private timerIntervalId: number | null = null;
  private isGameActive: boolean = false;

  // All available slices for the game
  private readonly fractionOptions: Fraction[] = [
    new Fraction(1, 2),
    new Fraction(1, 3),
    new Fraction(1, 4),
    new Fraction(1, 6),
    new Fraction(1, 8),
    new Fraction(1, 12),
    new Fraction(1, 24),
  ];

  constructor(screenSwitcher: ScreenSwitcher) {
    super();
    this.screenSwitcher = screenSwitcher;

    this.model = new PizzaMinigameModel(this.fractionOptions);

    this.view = new PizzaMinigameView({
      fractionOptions: this.fractionOptions,
      onBack: () => {
        // stop timer, reset counters when leaving
        this.stopTimer();
        this.model.resetCounters();
        this.screenSwitcher.switchToScreen({ type: "menu" });
      },
      onReset: () => {
        this.startNewPizza();
      },
      onSliceClick: (slice) => {
        this.handleSliceClick(slice);
      },
      onReady: () => {
        // View + texture ready; show the start popup
        this.view.showStartPopup();
      },
      onStart: () => {
        // begin the minigame after start click
        this.startTimer();
        this.startNewPizza();
      },
    });
  }

  getView(): PizzaMinigameView {
    return this.view;
  }

  // ---------------- Private helpers ----------------

  /**
   * Start a fresh pizza: clear visuals, random starting slice, reset HUD.
   */
  private startNewPizza(): void {
    this.view.clearSlices();

    const start = this.model.resetWithRandomStart();

    this.view.setCurrentFractionText(this.model.getCurrent());
    this.view.setStatusText("Click a fraction to add a slice");
    this.view.updatePizzasCompleted(this.model.getPizzasCompleted());

    // Draw the initial slice from 0 to `start`
    const zero = new Fraction(0, 1);
    this.view.addSliceVisual(zero, start);

    // generate and show initial answer choices
    this.refreshAnswerChoices();
  }

  private handleSliceClick(slice: Fraction): void {
    // stop allowing clicks when timer is done
    if (!this.isGameActive) {
      return;
    }

    if (!this.model.canAdd(slice)) {
      this.view.setStatusText("That would overflow the pizza. Try a smaller slice.");
      this.view.flashPizzaOverflow();
      return;
    }

    const { previous, next, completed } = this.model.addSlice(slice);

    this.view.addSliceVisual(previous, slice);
    this.view.setCurrentFractionText(next);

    if (completed) {
      this.view.setStatusText("Perfect! Pizza completed!");
      this.view.updatePizzasCompleted(this.model.getPizzasCompleted());
      this.view.flashPizzaSuccess();

      // After glow, start the next pizza
      window.setTimeout(() => {
        this.startNewPizza();
      }, 500);
    } else {
      this.view.setStatusText(`Added ${slice.toString()}.`);
      // update answer choices after each selection
      this.refreshAnswerChoices();
    }
  }

  /**
   * generate new answer choices, update the view
   */
  private refreshAnswerChoices(): void {
    const current = this.model.getCurrent();
    const choices = MinigameQuestionService.generateChoices(current, this.fractionOptions);
    this.view.updateButtons(choices);
  }

  /**
   * start game timer
   */
  private startTimer(): void {
    this.timeRemaining = PizzaMinigameController.GAME_DURATION;
    this.isGameActive = true;
    this.view.updateTimer(this.timeRemaining);

    this.timerIntervalId = window.setInterval(() => {
      this.timeRemaining -= 1;
      this.view.updateTimer(this.timeRemaining);

      if (this.timeRemaining <= 0) {
        this.endGame();
      }
    }, 1000);
  }

  /**
   * stop the timer and clean up
   */
  private stopTimer(): void {
    if (this.timerIntervalId !== null) {
      window.clearInterval(this.timerIntervalId);
      this.timerIntervalId = null;
    }
    this.isGameActive = false;
  }

  /**
   * end game when timer reaches 0
   */
  private endGame(): void {
    this.stopTimer();
    this.isGameActive = false;
    const pizzasCompleted = this.model.getPizzasCompleted();
    this.view.setStatusText(`GAME OVER! You completed ${pizzasCompleted} pizzas!`);

    // Return to menu after a delay
    window.setTimeout(() => {
      this.model.resetCounters();
      this.screenSwitcher.switchToScreen({ type: "board" });
    }, 3000);
  }
}
