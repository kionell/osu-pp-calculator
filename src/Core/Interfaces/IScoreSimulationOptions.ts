import { IBeatmapAttributes } from './IBeatmapAttributes';

/**
 * Options for score simulation.
 */
export interface IScoreSimulationOptions {
  /**
   * Beatmap attributes for score simulation.
   */
  attributes: IBeatmapAttributes;

  /**
   * Target score misses.
   */
  countMiss?: number,

  /**
   * Target score 50's.
   */
  count50?: number,

  /**
   * Target score 100's.
   */
  count100?: number,

  /**
   * Target score accuracy.
   */
  accuracy?: number;

  /**
   * Target total score.
   */
  totalScore?: number;

  /**
   * Target max combo of a score.
   */
  maxCombo?: number;

  /**
   * Target percent of max combo of a score.
   */
  percentCombo?: number;
}
