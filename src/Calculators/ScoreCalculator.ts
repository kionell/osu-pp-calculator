import { IScore, Score } from 'osu-classes';

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
  parseScore,
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
    let difficulty = options.difficulty && ruleset
      ? toDifficultyAttributes(options.difficulty, ruleset.id)
      : null;

    let score = attributes ? await this._createScore(options, attributes) : null;

    const beatmapTotalHits = attributes?.totalHits ?? 0;
    const scoreTotalHits = score?.info.totalHits ?? 0;
    const isPartialDifficulty = beatmapTotalHits > scoreTotalHits;

    if (!attributes || !beatmapMD5 || !ruleset || !score || !difficulty || (isPartialDifficulty && !options.fix)) {
      const { data, hash } = await parseBeatmap(options);

      beatmapMD5 ??= hash;
      rulesetId ??= data.mode;
      ruleset ??= getRulesetById(rulesetId);

      const combination = ruleset.createModCombination(options.mods);
      const beatmap = ruleset.applyToBeatmapWithMods(data, combination);

      attributes ??= createBeatmapAttributes(beatmap);
      score ??= await this._createScore(options, attributes);

      if (!difficulty || isPartialDifficulty) {
        difficulty = calculateDifficulty({
          totalHits: scoreTotalHits,
          beatmap,
          ruleset,
        });
      }
    }

    const scoreBeatmapMD5 = score.info.beatmapHashMD5;

    if (beatmapMD5 && scoreBeatmapMD5 && beatmapMD5 !== scoreBeatmapMD5) {
      throw new Error('Beatmap & replay missmatch!');
    }

    if (beatmapMD5 && !scoreBeatmapMD5) {
      score.info.beatmapHashMD5 = beatmapMD5;
    }

    const performance = calculatePerformance({
      scoreInfo: score.info,
      difficulty,
      ruleset,
    });

    return {
      scoreInfo: score.info.toJSON(),
      lifeBar: score.replay?.lifeBar,
      difficulty,
      performance,
    };
  }

  private async _createScore(options: IScoreCalculationOptions, attributes: IBeatmapAttributes): Promise<IScore> {
    const score = await this._parseOrSimulateScore(options, attributes);

    if (options.fix) {
      score.info = this._scoreSimulator.simulateFC(score.info, attributes);
    }

    return score;
  }

  private async _parseOrSimulateScore(options: IScoreCalculationOptions, attributes: IBeatmapAttributes): Promise<IScore> {
    const { scoreInfo, replayURL } = options;

    if (scoreInfo) {
      const info = toScoreInfo(scoreInfo);
      const replay = null;

      return new Score(info, replay);
    }

    if (!replayURL) {
      const info = this._scoreSimulator.simulate({ ...options, attributes });
      const replay = null;

      return new Score(info, replay);
    }

    const { data: score } = await parseScore(options);

    score.info = await this._scoreSimulator.completeReplay(score, attributes);

    return score;
  }
}
