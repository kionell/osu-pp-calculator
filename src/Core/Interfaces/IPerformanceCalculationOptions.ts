import {
  DifficultyAttributes,
  IRuleset,
  IScoreInfo,
} from 'osu-classes';

/**
 * Options for performance calculation of a score.
 */
export interface IPerformanceCalculationOptions {
  /**
   * Difficulty attributes of the target beatmap.
   */
  difficulty: DifficultyAttributes;

  /**
   * Target score information.
   */
  scoreInfo: IScoreInfo;

  /**
   * An instance of any ruleset.
   */
  ruleset: IRuleset;
}
