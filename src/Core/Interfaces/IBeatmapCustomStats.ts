/**
 * Custom beatmap stats for beatmap simulation.
 */
export interface IBeatmapCustomStats {
  /**
   * Custom approach rate for the target beatmap in range [0-11].
   */
  approachRate?: number;

  /**
   * Prevents scaling of approach rate from difficulty adjusting mods.
   * @default false
   */
  lockApproachRate?: boolean;

  /**
   * Custom overall difficulty for the target beatmap in range [0-11].
   */
  overallDifficulty?: number;

  /**
   * Prevents scaling of overall difficulty from difficulty adjusting mods.
   * @default false
   */
  lockOverallDifficulty?: boolean;

  /**
   * Custom circle size for the target beatmap in range [0-11].
   */
  circleSize?: number;

  /**
   * Prevents scaling of circle size from difficulty adjusting mods.
   * @default false
   */
  lockCircleSize?: boolean;

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
   * Use {@link lockApproachRate}, {@link lockOverallDifficulty} or {@link lockCircleSize}
   * @deprecated Since 3.2.0
   * @default false
   */
  lockStats?: boolean;
}
