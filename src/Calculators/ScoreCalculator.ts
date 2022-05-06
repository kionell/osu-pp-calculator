import {
  type IBeatmap,
  type IRuleset,
  type IScoreInfo,
} from 'osu-classes';

import {
  type IScoreCalculationOptions,
  type ICalculatedScore,
} from './Interfaces';

import {
  parseBeatmap,
  calculateDifficulty,
  calculatePerformance,
  getRulesetById,
} from '@Core';

/**
 * A score calculator.
 */
export class ScoreCalculator {
  /**
   * Calculates difficulty and performance of a score.
   * @param options Score calculation options.
   * @returns Calculated score.
   */
  async calculate(options: IScoreCalculationOptions): Promise<ICalculatedScore> {
    const scoreInfo = this._getScore(options);
    const ruleset = this._getRuleset(options);
    const beatmap = await this._getBeatmap(ruleset, options);

    const difficulty = calculateDifficulty({ beatmap, ruleset });

    const performance = calculatePerformance({
      difficulty,
      ruleset,
      scoreInfo,
    });

    return {
      beatmap,
      scoreInfo,
      difficulty,
      performance,
    };
  }

  /**
   * Tries to get ruleset instance from beatmap calculation options.
   * @param options Beatmap calculation options.
   * @returns Ruleset instance.
   */
  private _getRuleset({ ruleset, rulesetId }: IScoreCalculationOptions): IRuleset {
    return ruleset ?? getRulesetById(rulesetId);
  }

  /**
   * Tries to get ruleset instance from beatmap calculation options.
   * @param options Beatmap calculation options.
   * @returns Ruleset instance.
   */
  private _getScore({ scoreInfo }: IScoreCalculationOptions): IScoreInfo {
    if (scoreInfo) return scoreInfo;

    throw new Error('Wrong score information!');
  }

  /**
   * Tries to get parsed beatmap instance from beatmap calculation options.
   * @param ruleset Ruleset instance.
   * @param options Beatmap calculation options.
   * @returns Parsed beatmap instance.
   */
  private async _getBeatmap(ruleset: IRuleset, options: IScoreCalculationOptions): Promise<IBeatmap> {
    if (options.beatmap) return options.beatmap;

    const parsed = await parseBeatmap(options);
    const combination = ruleset.createModCombination(options.mods);

    return ruleset.applyToBeatmapWithMods(parsed, combination);
  }
}
