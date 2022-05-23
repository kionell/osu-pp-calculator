import type {
  IJsonableBeatmapInfo,
  DifficultyAttributes,
  PerformanceAttributes,
} from 'osu-classes';

import { IBeatmapAttributes, IBeatmapSkill } from '@Core';

/**
 * Calculated beatmap.
 */
export interface ICalculatedBeatmap {
  /**
   * Beatmap information.
   */
  beatmapInfo: IJsonableBeatmapInfo;

  /**
   * Beatmap missing attributes.
   */
  attributes: IBeatmapAttributes;

  /**
   * Beatmap skill data.
   */
  skills: IBeatmapSkill[] | null;

  /**
   * Difficulty attributes of calculated beatmap.
   */
  difficulty: DifficultyAttributes;

  /**
   * List of performance attributes of calculated beatmap.
   */
  performance: PerformanceAttributes[];
}
