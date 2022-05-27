/**
 * Options for score parsing.
 */
export interface IScoreParsingOptions {
  /**
   * Custom replay file URL.
   */
  replayURL?: string;

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
