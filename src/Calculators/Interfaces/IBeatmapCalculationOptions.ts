import { GameMode, IBeatmapParsingOptions } from '@Core';
import { DifficultyAttributes, IBeatmap, IRuleset } from 'osu-classes';

/**
 * Options for beatmap calculation.
 */
export interface IBeatmapCalculationOptions extends IBeatmapParsingOptions {
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
   * List of total scores for osu!mania or list of accuracy for other game modes.
   */
  values?: number[];
}
