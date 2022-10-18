/**
 * Custom beatmap stats for beatmap simulation.
 */
export interface IBeatmapCustomStats {
  /**
   * Custom approach rate for the target beatmap in range [0-11].
   */
  approachRate?: number;

  /**
   * Custom overall difficulty for the target beatmap in range [0-11].
   */
  overallDifficulty?: number;

  /**
   * Custom circle size for the target beatmap in range [0-11].
   */
  circleSize?: number;

  /**
   * Custom clock rate for the target beatmap in range [0.25-3].
   */
  clockRate?: number;

  /**
   * Custom BPM for the target beatmap in range [60-10000].
   * Can exceed clockrate limits.
   */
  bpm?: number;

  /**
   * Prevents scaling of stats from difficulty adjusting mods.
   * @default false
   */
  lockStats?: boolean;
}
