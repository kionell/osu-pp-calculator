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
  toScoreInfo,
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
    let attributes = options.attributes;
    let beatmapMD5 = options.hash ?? options.attributes?.hash;
    let rulesetId = options.rulesetId ?? options.attributes?.rulesetId;
    let ruleset = options.ruleset ?? getRulesetById(rulesetId);
    let scoreInfo = options.scoreInfo ? toScoreInfo(options.scoreInfo) : null;
    let difficulty = options.difficulty && ruleset
      ? toDifficultyAttributes(options.difficulty, ruleset.id)
      : null;

    if (!scoreInfo && attributes) {
      scoreInfo = await this._createScoreInfo(options, attributes);
    }

    const beatmapTotalHits = attributes?.totalHits ?? 0;
    const scoreTotalHits = scoreInfo?.totalHits ?? 0;
    const isPartialDifficulty = beatmapTotalHits > scoreTotalHits;

    if (!attributes || !beatmapMD5 || !ruleset || !scoreInfo || !difficulty || isPartialDifficulty) {
      const { data, hash } = await parseBeatmap(options);

      beatmapMD5 ??= hash;
      rulesetId ??= data.mode;
      ruleset ??= getRulesetById(rulesetId);

      const combination = ruleset.createModCombination(options.mods);
      const beatmap = ruleset.applyToBeatmapWithMods(data, combination);

      attributes ??= createBeatmapAttributes(beatmap);
      scoreInfo ??= await this._createScoreInfo(options, attributes);

      if (!difficulty || isPartialDifficulty) {
        difficulty = calculateDifficulty({
          totalHits: scoreTotalHits,
          beatmap,
          ruleset,
        });
      }
    }

    const scoreBeatmapMD5 = scoreInfo.beatmapHashMD5;

    if (beatmapMD5 && scoreBeatmapMD5 && beatmapMD5 !== scoreBeatmapMD5) {
      throw new Error('Beatmap & replay missmatch!');
    }

    if (beatmapMD5 && !scoreBeatmapMD5) {
      scoreInfo.beatmapHashMD5 = beatmapMD5;
    }

    const performance = calculatePerformance({
      ruleset,
      difficulty,
      scoreInfo,
    });

    return {
      scoreInfo: scoreInfo.toJSON(),
      difficulty,
      performance,
    };
  }

  private async _createScoreInfo(
    options: IScoreCalculationOptions,
    attributes: IBeatmapAttributes,
  ): Promise<IScoreInfo> {
    const scoreInfo = await this._parseOrSimulateScoreInfo(options, attributes);

    if (!options.fix) return scoreInfo;

    return this._scoreSimulator.simulateFC(scoreInfo, attributes);
  }

  private async _parseOrSimulateScoreInfo(
    options: IScoreCalculationOptions,
    attributes: IBeatmapAttributes,
  ): Promise<IScoreInfo> {
    if (!options.replayURL) {
      return this._scoreSimulator.simulate({ ...options, attributes });
    }

    return this._scoreSimulator.simulateReplay(options.replayURL, attributes);
  }
}
