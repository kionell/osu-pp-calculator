import { GameMode, IBeatmapParsingOptions } from '@Core';
import { DifficultyAttributes, IRuleset } from 'osu-classes';

/**
 * Options for beatmap calculation.
 */
export interface IBeatmapCalculationOptions extends IBeatmapParsingOptions {
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
   * List of accuracy for all game modes except osu!mania.
   */
  accuracy?: number[];

  /**
   * List of total scores for osu!mania game mode.
   */
  totalScores?: number[];
}
