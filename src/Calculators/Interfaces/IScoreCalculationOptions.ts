import { GameMode, IBeatmapParsingOptions } from '@Core';
import { DifficultyAttributes, IBeatmap, IRuleset, IScoreInfo } from 'osu-classes';

/**
 * Options for score calculation.
 */
export interface IScoreCalculationOptions extends IBeatmapParsingOptions {
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
  difficulty?: DifficultyAttributes;

  /**
   * Target score.
   */
  scoreInfo?: IScoreInfo;
}
