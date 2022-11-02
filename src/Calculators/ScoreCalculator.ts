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
  applyCustomStats,
  applyCustomCircleSize,
  getTotalHits,
} from '../Core';

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

    let score = null;

    let beatmapTotalHits = attributes?.totalHits ?? 0;
    let scoreTotalHits = options?.totalHits ?? attributes?.totalHits ?? 0;
    let isPartialDifficulty = beatmapTotalHits > scoreTotalHits;

    if (attributes) {
      score = await this._createScore(options, {
        ...attributes,
        totalHits: options?.totalHits ?? attributes.totalHits,
      });
    }

    // TODO: This looks really bad and should be rewritten.
    if (!attributes || !beatmapMD5 || !ruleset || !score || !difficulty || (isPartialDifficulty && !options.fix)) {
      const { data, hash } = await parseBeatmap(options);

      const combination = ruleset.createModCombination(options.mods);

      /**
       * Apply custom circle size before applying ruleset & mods.
       * Circle size actually affects the conversion process.
       */
      applyCustomCircleSize(data, combination, options);

      beatmapMD5 ??= hash;
      rulesetId ??= data.mode;
      ruleset ??= getRulesetById(rulesetId);

      const beatmap = ruleset.applyToBeatmapWithMods(data, combination);

      /**
       * Apply custom beatmap stats after applying ruleset & mods
       * to ignore clock rate mods (DT, NC, HT...).
       */
      applyCustomStats(beatmap, combination, options);

      if (!attributes) {
        attributes = createBeatmapAttributes(beatmap);
      }

      beatmapTotalHits = getTotalHits(beatmap) ?? 0;
      scoreTotalHits = options?.totalHits ?? attributes.totalHits ?? 0;

      score ??= await this._createScore(options, {
        ...attributes,
        totalHits: Math.min(beatmapTotalHits, scoreTotalHits),
      });

      isPartialDifficulty = beatmapTotalHits > scoreTotalHits;

      if (!difficulty || isPartialDifficulty) {
        difficulty = calculateDifficulty({
          totalHits: scoreTotalHits,
          beatmap,
          ruleset,
        });
      }

      if (isPartialDifficulty) {
        score.info.rank = 'F';
        score.info.passed = false;
        score.info.perfect = false;
        score.info.maxCombo = Math.min(score.info.maxCombo, difficulty.maxCombo);
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
