import {
  type IScoreInfo,
  ScoreInfo,
  ScoreRank,
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
   * Simulates a score by score simulation options.
   * @param options Score simulation options.
   * @returns Simulated score.
   */
  simulate(options: IScoreSimulationOptions): IScoreInfo {
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
    const multiplier = Math.max(0, Math.min(percentage, 100)) / 100;

    const scoreCombo = options.maxCombo ?? beatmapCombo * multiplier;
    const misses = statistics.miss ?? 0;

    // We need to limit max combo with score misses.
    const limitedCombo = Math.min(scoreCombo, beatmapCombo - misses);
    const maxCombo = Math.max(0, limitedCombo);

    const scoreInfo = this._generateScoreInfo({
      beatmapId: attributes.beatmapId,
      rulesetId: attributes.rulesetId,
      totalHits: attributes.totalHits,
      mods: toCombination(attributes.mods, attributes.rulesetId),
      totalScore: options.totalScore,
      perfect: maxCombo >= beatmapCombo,
      statistics,
      maxCombo,
    });

    return scoreInfo;
  }

  /**
   * Simulates a new score with full combo.
   * @param scoreInfo Original score.
   * @param attributes Beatmap attributes of this score.
   * @returns Simulated FC score.
   */
  simulateFC(scoreInfo: IScoreInfo, attributes: IBeatmapAttributes): IScoreInfo {
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
      mods: scoreInfo.mods
        ?? toCombination(attributes.mods, attributes.rulesetId),

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
  simulateMax(attributes: IBeatmapAttributes): IScoreInfo {
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

  private _generateScoreInfo(options: Partial<IScoreInfo>): IScoreInfo {
    const scoreInfo = new ScoreInfo();

    scoreInfo.beatmapId = options?.beatmapId ?? 0;
    scoreInfo.userId = options?.userId ?? 0;
    scoreInfo.username = options?.username ?? 'osu!';
    scoreInfo.maxCombo = options?.maxCombo ?? 0;
    scoreInfo.statistics = getValidHitStatistics(options?.statistics);
    scoreInfo.mods = options?.mods?.clone() ?? null;
    scoreInfo.rulesetId = options?.rulesetId ?? GameMode.Osu;
    scoreInfo.passed = scoreInfo.totalHits >= (options?.totalHits ?? 0);
    scoreInfo.perfect = options?.perfect ?? false;
    scoreInfo.totalScore = options?.totalScore
      ?? scaleTotalScore(1e6, scoreInfo.mods);

    scoreInfo.accuracy = options.accuracy
      ?? calculateAccuracy(scoreInfo);

    scoreInfo.rank = ScoreRank[calculateRank(scoreInfo)] as keyof typeof ScoreRank;

    return scoreInfo;
  }
}
