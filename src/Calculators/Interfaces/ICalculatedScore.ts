import {
  IJsonableScoreInfo,
  DifficultyAttributes,
  PerformanceAttributes,
  ILifeBarFrame,
} from 'osu-classes';

/**
 * Calculated score.
 */
export interface ICalculatedScore {
  /**
   * Score information.
   */
  scoreInfo: IJsonableScoreInfo;

  /**
   * Difficulty attributes of calculated beatmap.
   */
  difficulty: DifficultyAttributes;

  /**
   * List of performance attributes of calculated beatmap.
   */
  performance: PerformanceAttributes;

  /**
   * Replay life bar.
   */
  lifeBar?: ILifeBarFrame[];
}
