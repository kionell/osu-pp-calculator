import type { IRuleset, IScoreInfo } from 'osu-classes';
import type { GameMode, IBeatmapParsingOptions, IDifficultyAttributes, IScoreSimulationOptions } from '@Core';

/**
 * Options for score calculation.
 */
export interface IScoreCalculationOptions extends IBeatmapParsingOptions, IScoreSimulationOptions {
  /**
   * Ruleset ID.
   */
  rulesetId?: GameMode;

  /**
   * Custom ruleset instance. 
   */
  ruleset?: IRuleset;

  /**
   * Mod combination or bitwise.
   */
  mods?: string | number;

  /**
   * Precalculated difficulty attributes.
   */
  difficulty?: IDifficultyAttributes;

  /**
   * Target score.
   */
  scoreInfo?: IScoreInfo;
}
