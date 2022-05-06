import {
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
    const parsed = options.beatmap ?? await parseBeatmap(options);
    const ruleset = options.ruleset ?? getRulesetById(options.rulesetId ?? parsed.mode);
    const combination = ruleset.createModCombination(options.mods);

    const beatmap = ruleset.applyToBeatmapWithMods(parsed, combination);

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
  private _getScore({ scoreInfo }: IScoreCalculationOptions): IScoreInfo {
    if (scoreInfo) return scoreInfo;

    throw new Error('Wrong score information!');
  }
}
