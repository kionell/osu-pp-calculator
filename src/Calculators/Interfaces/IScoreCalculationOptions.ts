import { GameMode, IBeatmapParsingOptions } from '@Core';
import { DifficultyAttributes, IBeatmap, IRuleset, IScoreInfo } from 'osu-classes';

/**
 * Options for score calculation.
 */
export interface IScoreCalculationOptions extends IBeatmapParsingOptions {
  /**
   * Any beatmap. This can be used to skip beatmap parsing process.
   */
  beatmap?: IBeatmap;

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
