export class SleeperService {
  /**
   * Sleep for certaian amount of milliseconds.
   */
  static async sleep(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
}
