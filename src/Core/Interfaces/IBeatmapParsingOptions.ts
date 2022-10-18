/**
 * Options for beatmap parsing.
 */
export interface IBeatmapParsingOptions {
  /**
   * ID of the target beatmap.
   */
  beatmapId?: string | number;

  /**
   * Custom file URL of the target beatmap.
   */
  fileURL?: string;

  /**
   * Path to the beatmap file save location.
   * @default "./cache"
   */
  savePath?: string;

  /**
   * Should files be cached on a disk after calculation?
   * @default true
   */
  cacheFiles?: boolean;

  /**
   * Hash of the target beatmap. Used to validate beatmap files.
   * If wasn't specified then file will not be validated.
   */
  hash?: string;
}
