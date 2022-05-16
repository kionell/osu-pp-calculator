import {
  type IBeatmap,
  type IScoreInfo,
  ScoreInfo,
  ScoreRank,
} from 'osu-classes';

import {
  generateHitStatistics,
  getMaxCombo,
  getMods,
  getTotalHits,
  getValidHitStatistics,
  calculateAccuracy,
  calculateRank,
} from './Utils';

import { GameMode } from './Enums';
import type { IScoreSimulationOptions } from './Interfaces';

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
      options.beatmap,
      options.accuracy,
      options.countMiss,
      options.count50,
      options.count100,
    );

    const beatmap = options.beatmap;
    const beatmapCombo = getMaxCombo(beatmap);
    const percentage = options.percentCombo ?? 100;
    const multiplier = Math.max(0, Math.min(percentage, 100)) / 100;

    const scoreCombo = options.maxCombo ?? beatmapCombo * multiplier;
    const misses = statistics.miss ?? 0;

    // We need to limit max combo with score misses.
    const limitedCombo = Math.min(scoreCombo, beatmapCombo - misses);
    const maxCombo = Math.max(0, limitedCombo);

    const scoreInfo = this._generateScoreInfo({
      beatmapId: beatmap.metadata.beatmapId,
      perfect: maxCombo >= beatmapCombo,
      totalScore: options.totalScore,
      rulesetId: beatmap.mode,
      mods: getMods(options.beatmap),
      totalHits: getTotalHits(beatmap),
      statistics,
      maxCombo,
    });

    return scoreInfo;
  }

  /**
   * Simulates a new score with full combo.
   * @param scoreInfo Original score.
   * @param beatmap Beatmap of the score.
   * @returns Simulated FC score.
   */
  simulateFC(scoreInfo: IScoreInfo, beatmap: IBeatmap): IScoreInfo {
    if (scoreInfo.rulesetId === GameMode.Mania) {
      return this.simulateMax(beatmap);
    }

    const statistics = getValidHitStatistics(scoreInfo.statistics);
    const totalHits = getTotalHits(beatmap);

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
      beatmapId: beatmap.metadata.beatmapId,
      perfect: true,
      rulesetId: beatmap.mode,
      maxCombo: getMaxCombo(beatmap),
      mods: scoreInfo.mods ?? getMods(beatmap),
      statistics,
      totalHits,
    });
  }

  /**
   * Simulates a new score with max possible performance.
   * @param beatmap Beatmap of the score.
   * @returns Simulated SS score.
   */
  simulateMax(beatmap: IBeatmap): IScoreInfo {
    const statistics = generateHitStatistics(beatmap);
    const totalHits = getTotalHits(beatmap);

    const score = this._generateScoreInfo({
      beatmapId: beatmap.metadata.beatmapId,
      perfect: true,
      rulesetId: beatmap.mode,
      maxCombo: getMaxCombo(beatmap),
      mods: getMods(beatmap),
      statistics,
      totalHits,
    });

    if (beatmap.mode === GameMode.Mania) {
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
    ?? (scoreInfo.rulesetId === GameMode.Mania ? 1e6 : 0);

    scoreInfo.accuracy = options.accuracy ?? calculateAccuracy(scoreInfo);
    scoreInfo.rank = ScoreRank[calculateRank(scoreInfo)] as keyof typeof ScoreRank;

    return scoreInfo;
  }
}
