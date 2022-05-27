import type { IBeatmapInfo, IJsonableBeatmapInfo, IRuleset } from 'osu-classes';
import type { GameMode, IBeatmapAttributes, IBeatmapParsingOptions, IDifficultyAttributes } from '@Core';

/**
 * Options for beatmap calculation.
 */
export interface IBeatmapCalculationOptions extends IBeatmapParsingOptions {
  /**
   * Precalculated beatmap information.
   */
  beatmapInfo?: IBeatmapInfo | IJsonableBeatmapInfo;

  /**
   * Beatmap attributes for score simulation.
   */
  attributes?: IBeatmapAttributes;

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
   * Output strain peaks or not.
   */
  strains?: boolean;

  /**
   * List of accuracy for all game modes except osu!mania.
   */
  accuracy?: number[];

  /**
   * List of total scores for osu!mania game mode.
   */
  totalScores?: number[];
}
