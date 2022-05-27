import { IScoreInfo } from 'osu-classes';

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
  toDifficultyAttributes,
  createBeatmapAttributes,
  IBeatmapAttributes,
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
    if (this._checkPrecalculated(options)) {
      return await this._processPrecalculated(options as Required<IScoreCalculationOptions>);
    }

    const { data: parsed, hash } = await parseBeatmap(options);

    const ruleset = options.ruleset
      ?? getRulesetById(options.rulesetId ?? parsed.mode);

    const combination = ruleset.createModCombination(options.mods);
    const beatmap = ruleset.applyToBeatmapWithMods(parsed, combination);
    const attributes = options.attributes ?? createBeatmapAttributes(beatmap);

    const difficulty = options.difficulty
      ? toDifficultyAttributes(options.difficulty, ruleset.id)
      : calculateDifficulty({ beatmap, ruleset });

    const scoreInfo = await this._getScoreInfo(options, attributes);

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

  /**
   * This is the special case in which all precalculated stuff is present.
   * @param options Score calculation options.
   * @returns Calculated score.
   */
  private async _processPrecalculated(options: Required<IScoreCalculationOptions>): Promise<ICalculatedScore> {
    const ruleset = options.ruleset ?? getRulesetById(options.attributes.rulesetId);

    const scoreInfo = await this._getScoreInfo(options, options.attributes);

    const difficulty = toDifficultyAttributes(options.difficulty, ruleset.id);

    if (options.attributes.hash || options.hash) {
      scoreInfo.beatmapHashMD5 = options.attributes.hash ?? options.hash;
    }

    const performance = calculatePerformance({
      ruleset,
      scoreInfo,
      difficulty,
    });

    return {
      scoreInfo: scoreInfo.toJSON(),
      difficulty,
      performance,
    };
  }

  private async _getScoreInfo(options: IScoreCalculationOptions, attributes: IBeatmapAttributes): Promise<IScoreInfo> {
    const { scoreInfo, replayURL } = options;

    if (scoreInfo) return scoreInfo;

    if (replayURL) {
      return await this._scoreSimulator.simulateReplay(replayURL, attributes);
    }

    return this._scoreSimulator.simulate({ ...options, attributes });
  }

  /**
   * Tests these score calculation options for the possibility of skipping beatmap parsing. 
   * @param options Score calculation options.
   * @returns If these options enough to skip beatmap parsing.
   */
  private _checkPrecalculated(options: IScoreCalculationOptions): boolean {
    return !!options.attributes && !!options.difficulty;
  }
}
