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
    const { data: parsed, hash } = await parseBeatmap(options);

    const ruleset = options.ruleset
      ?? getRulesetById(options.rulesetId ?? parsed.mode);

    const combination = ruleset.createModCombination(options.mods);

    const beatmap = ruleset.applyToBeatmapWithMods(parsed, combination);

    const difficulty = options.difficulty
      ?? calculateDifficulty({ beatmap, ruleset });

    const scoreInfo = options.scoreInfo
      ?? this._scoreSimulator.simulate({ ...options, beatmap });

    scoreInfo.beatmapHashMD5 = hash;

    const performance = calculatePerformance({
      ruleset: getRulesetById(difficulty.mods.mode),
      difficulty,
      scoreInfo,
    });

    return {
      scoreInfo: scoreInfo.toJSON(),
      difficulty,
      performance,
    };
  }
}
