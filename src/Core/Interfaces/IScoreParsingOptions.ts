/**
 * Options for beatmap parsing.
 */
export interface IScoreParsingOptions {
  /**
   * Custom file URL of the target replay.
   */
  fileURL?: string;

  /**
   * Path to the replay file save location.
   */
  savePath?: string;

  /**
   * Hash of the target replay. Used to validate beatmap files.
   * If wasn't specified then file will not be validated.
   */
  hash?: string;
}
