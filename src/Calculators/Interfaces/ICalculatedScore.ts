import {
  IBeatmap,
  IScoreInfo,
  DifficultyAttributes,
  PerformanceAttributes,
} from 'osu-classes';

/**
 * Calculated score.
 */
export interface ICalculatedScore {
  /**
   * Parsed beatmap with applied ruleset.
   */
  beatmap: IBeatmap;

  /**
   * Score information.
   */
  scoreInfo: IScoreInfo;

  /**
   * Difficulty attributes of calculated beatmap.
   */
  difficulty: DifficultyAttributes;

  /**
   * List of performance attributes of calculated beatmap.
   */
  performance: PerformanceAttributes;
}
