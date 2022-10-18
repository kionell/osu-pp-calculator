import type {
  IBeatmapInfo,
  IJsonableBeatmapInfo,
  IRuleset,
} from 'osu-classes';

import type {
  GameMode,
  IBeatmapAttributes,
  IBeatmapCustomStats,
  IBeatmapParsingOptions,
  IDifficultyAttributes,
} from '../../Core';

/**
 * Options for beatmap calculation.
 */
export interface IBeatmapCalculationOptions extends IBeatmapParsingOptions, IBeatmapCustomStats {
  /**
   * Precalculated beatmap information.
   */
  beatmapInfo?: IBeatmapInfo | IJsonableBeatmapInfo;

  /**
   * Missing beatmap attributes that are required to simulate scores.
   * This is used only for osu!catch which requires the number of fruits and droplets.
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
   * Total hits for gradual beatmap difficulty calculation.
   * If it differs from the hit object count of 
   * a full beatmap then it will force difficulty calculation.
   */
  totalHits?: number;

  /**
   * Output strain peaks or not.
   */
  strains?: boolean;

  /**
   * List of accuracy for all game modes except osu!mania.
   */
  accuracy?: number[];
}
