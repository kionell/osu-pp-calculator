import {
  DifficultyAttributes,
  type IScoreInfo,
} from 'osu-classes';

import {
  type IScoreCalculationOptions,
  type ICalculatedScore,
} from './Interfaces';

import {
  ScoreSimulator,
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
   * Instance of a score simulator.
   */
  private _scoreSimulator = new ScoreSimulator();

  /**
   * Calculates difficulty and performance of a score.
   * @param options Score calculation options.
   * @returns Calculated score.
   */
  async calculate(options: IScoreCalculationOptions): Promise<ICalculatedScore> {
    const scoreInfo = this._getScore(options);
    const difficulty = await this._getDifficulty(options);

    const performance = calculatePerformance({
      ruleset: getRulesetById(difficulty.mods.mode),
      difficulty,
      scoreInfo,
    });

    return {
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
  private _getScore(options: IScoreCalculationOptions): IScoreInfo {
    if (options.scoreInfo) return options.scoreInfo;

    return this._scoreSimulator.simulate(options);
  }

  private async _getDifficulty(options: IScoreCalculationOptions): Promise<DifficultyAttributes> {
    if (options.difficulty) return options.difficulty;

    const parsed = await parseBeatmap(options);

    const ruleset = options.ruleset
      ?? getRulesetById(options.rulesetId ?? parsed.data.mode);

    return calculateDifficulty({
      beatmap: parsed.data,
      ruleset,
    });
  }
}
