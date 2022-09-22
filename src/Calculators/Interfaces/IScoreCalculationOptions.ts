import type { IJsonableScoreInfo, IRuleset, IScoreInfo } from 'osu-classes';

import type {
  GameMode,
  IBeatmapCustomStats,
  IDifficultyAttributes,
  IScoreParsingOptions,
  IScoreSimulationOptions,
} from '@Core';

/**
 * Options for score calculation.
 */
export interface IScoreCalculationOptions
  extends IScoreParsingOptions, Partial<IScoreSimulationOptions>, IBeatmapCustomStats {
  /**
   * Beatmap ID of this score.
   */
  beatmapId?: number;

  /**
   * Custom beatmap file URL of this score.
   */
  fileURL?: string;

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
  scoreInfo?: IScoreInfo | IJsonableScoreInfo;

  /**
   * Should this score be unchoked or not?
   */
  fix?: boolean;
}
