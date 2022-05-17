import type {
  IJsonableBeatmapInfo,
  DifficultyAttributes,
  PerformanceAttributes,
} from 'osu-classes';

/**
 * Calculated beatmap.
 */
export interface ICalculatedBeatmap {
  /**
   * Beatmap information.
   */
  beatmapInfo: IJsonableBeatmapInfo;

  /**
   * Difficulty attributes of calculated beatmap.
   */
  difficulty: DifficultyAttributes;

  /**
   * List of performance attributes of calculated beatmap.
   */
  performance: PerformanceAttributes[];
}
