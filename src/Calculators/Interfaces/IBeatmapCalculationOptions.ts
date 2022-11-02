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
   * Custom ruleset instance (for non-supported rulesets).
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
   * Whether to output strain peaks or not.
   */
  strains?: boolean;

  /**
   * List of accuracy for all game modes.
   */
  accuracy?: number[];
}
