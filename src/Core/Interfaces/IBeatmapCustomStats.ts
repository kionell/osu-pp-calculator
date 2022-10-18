/**
 * Custom beatmap stats for beatmap simulation.
 */
export interface IBeatmapCustomStats {
  /**
   * Custom approach rate for the target beatmap.
   */
  approachRate?: number;

  /**
   * Custom overall difficulty for the target beatmap.
   */
  overallDifficulty?: number;

  /**
   * Custom circle size for the target beatmap.
   */
  circleSize?: number;

  /**
   * Custom clock rate for the target beatmap.
   */
  clockRate?: number;

  /**
   * Custom BPM for the target beatmap.
   */
  bpm?: number;

  /**
   * Prevents scaling of stats from difficulty adjusting mods.
   * @default false
   */
  lockStats?: boolean;
}
