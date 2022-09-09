import {
  type IScoreInfo,
  ScoreInfo,
  ScoreRank,
  MathUtils,
  IScore,
} from 'osu-classes';

import {
  generateHitStatistics,
  getValidHitStatistics,
  calculateAccuracy,
  calculateRank,
  scaleTotalScore,
  toCombination,
} from './Utils';

import { GameMode } from './Enums';
import type { IBeatmapAttributes, IScoreSimulationOptions } from './Interfaces';

/**
 * A score simulator.
 */
export class ScoreSimulator {
  /**
   * Adds missing properties to a score parsed from a replay file. 
   * @param score Parsed score from the replay file.
   * @param attributes Beatmap attributes of this score.
   * @returns Completed score info.
   */
  async completeReplay(score: IScore, attributes: IBeatmapAttributes): Promise<IScoreInfo> {
    const scoreInfo = score.info;
    const beatmapCombo = attributes.maxCombo ?? 0;

    return this._generateScoreInfo({
      ...scoreInfo,
      beatmapId: attributes.beatmapId,
      rulesetId: attributes.rulesetId,
      totalHits: attributes.totalHits,
      mods: toCombination(attributes.mods, attributes.rulesetId),
      perfect: scoreInfo.maxCombo >= beatmapCombo,
    });
  }

  /**
   * Simulates a score by score simulation options.
   * @param options Score simulation options.
   * @returns Simulated score.
   */
  simulate(options: IScoreSimulationOptions): ScoreInfo {
    const statistics = generateHitStatistics(
      options.attributes,
      options.accuracy,
      options.countMiss,
      options.count50,
      options.count100,
    );

    const attributes = options.attributes;
    const beatmapCombo = attributes.maxCombo ?? 0;
    const percentage = options.percentCombo ?? 100;
    const multiplier = MathUtils.clamp(percentage, 0, 100) / 100;

    const scoreCombo = options.maxCombo ?? Math.round(beatmapCombo * multiplier);
    const misses = statistics.miss ?? 0;

    // We need to limit max combo with score misses.
    const limitedCombo = Math.min(scoreCombo, beatmapCombo - misses);
    const maxCombo = Math.max(0, limitedCombo);

    return this._generateScoreInfo({
      beatmapId: attributes.beatmapId,
      rulesetId: attributes.rulesetId,
      totalHits: attributes.totalHits,
      mods: toCombination(attributes.mods, attributes.rulesetId),
      totalScore: options.totalScore,
      perfect: maxCombo >= beatmapCombo,
      statistics,
      maxCombo,
    });
  }

  /**
   * Simulates a new score with full combo.
   * @param scoreInfo Original score.
   * @param attributes Beatmap attributes of this score.
   * @returns Simulated FC score.
   */
  simulateFC(scoreInfo: IScoreInfo, attributes: IBeatmapAttributes): ScoreInfo {
    if (scoreInfo.rulesetId === GameMode.Mania) {
      return this.simulateMax(attributes);
    }

    const statistics = getValidHitStatistics(scoreInfo.statistics);
    const totalHits = attributes.totalHits ?? 0;

    switch (scoreInfo.rulesetId) {
      case GameMode.Fruits:
        statistics.great = totalHits - statistics.largeTickHit
          - statistics.smallTickHit - statistics.smallTickMiss - statistics.miss;

        statistics.largeTickHit += statistics.miss;

        break;

      case GameMode.Mania:
        statistics.perfect = totalHits - statistics.great
          - statistics.good - statistics.ok - statistics.meh;

        break;

      default:
        statistics.great = totalHits - statistics.ok - statistics.meh;
    }

    statistics.miss = 0;

    return this._generateScoreInfo({
      ...scoreInfo,
      mods: scoreInfo.mods ?? toCombination(attributes.mods, attributes.rulesetId),
      beatmapId: attributes.beatmapId,
      rulesetId: attributes.rulesetId,
      maxCombo: attributes.maxCombo,
      perfect: true,
      statistics,
      totalHits,
    });
  }

  /**
   * Simulates a new score with max possible performance.
   * @param attributes Beatmap attributes of this score.
   * @returns Simulated SS score.
   */
  simulateMax(attributes: IBeatmapAttributes): ScoreInfo {
    const statistics = generateHitStatistics(attributes);
    const totalHits = attributes.totalHits ?? 0;

    const score = this._generateScoreInfo({
      beatmapId: attributes.beatmapId,
      rulesetId: attributes.rulesetId,
      maxCombo: attributes.maxCombo,
      mods: toCombination(attributes.mods, attributes.rulesetId),
      perfect: true,
      statistics,
      totalHits,
    });

    if (attributes.rulesetId === GameMode.Mania) {
      score.totalScore = 1e6;
    }

    return score;
  }

  private _generateScoreInfo(options: Partial<IScoreInfo>): ScoreInfo {
    const scoreInfo = new ScoreInfo({
      id: options?.id,
      beatmapId: options?.beatmapId,
      userId: options?.userId,
      username: options?.username ?? 'osu!',
      maxCombo: options?.maxCombo,
      statistics: getValidHitStatistics(options?.statistics),
      rawMods: options?.rawMods,
      rulesetId: options?.rulesetId,
      perfect: options?.perfect,
      beatmapHashMD5: options?.beatmapHashMD5,
      date: options?.date,
      pp: options?.pp,
    });

    if (options?.mods) scoreInfo.mods = options.mods;

    if (scoreInfo.rulesetId === GameMode.Mania) {
      scoreInfo.totalScore = options?.totalScore || scaleTotalScore(1e6, scoreInfo.mods);
    }

    scoreInfo.passed = scoreInfo.totalHits >= (options?.totalHits ?? 0);
    scoreInfo.accuracy = calculateAccuracy(scoreInfo);

    scoreInfo.rank = ScoreRank[calculateRank(scoreInfo)] as keyof typeof ScoreRank;

    return scoreInfo;
  }
}
