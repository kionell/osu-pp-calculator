import { GameMode, IBeatmapParsingOptions, IScoreSimulationOptions } from '@Core';
import { DifficultyAttributes, IRuleset, IScoreInfo } from 'osu-classes';

/**
 * Options for score calculation.
 */
export interface IScoreCalculationOptions
  extends IBeatmapParsingOptions, Omit<IScoreSimulationOptions, 'beatmap'> {
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
