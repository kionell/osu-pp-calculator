import type {
  IBeatmap,
  DifficultyAttributes,
  PerformanceAttributes,
} from 'osu-classes';

/**
 * Calculated beatmap.
 */
export interface ICalculatedBeatmap {
  /**
   * Parsed beatmap with applied ruleset.
   */
  beatmap: IBeatmap;

  /**
   * Difficulty attributes of calculated beatmap.
   */
  difficulty: DifficultyAttributes;

  /**
   * List of performance attributes of calculated beatmap.
   */
  performance: PerformanceAttributes[];
}
