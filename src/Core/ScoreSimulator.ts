import {
  type IScoreInfo,
  ScoreInfo,
  MathUtils,
  IScore,
  HitResult,
  HitStatistics,
} from 'osu-classes';

import {
  generateHitStatistics,
  toCombination,
} from './Utils';

import {
  IBeatmapAttributes,
  IScoreSimulationOptions,
} from './Interfaces';

import { GameMode } from './Enums';

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
    const statistics = generateHitStatistics(options);

    const attributes = options.attributes;
    const beatmapCombo = attributes.maxCombo ?? 0;
    const percentage = options.percentCombo ?? 100;
    const multiplier = MathUtils.clamp(percentage, 0, 100) / 100;

    const scoreCombo = options.maxCombo ?? Math.round(beatmapCombo * multiplier);
    const misses = statistics.get(HitResult.Miss);

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

    const statistics = scoreInfo.statistics;
    const totalHits = attributes.totalHits ?? 0;

    switch (scoreInfo.rulesetId) {
      case GameMode.Fruits: {
        const largeTickHit = statistics.get(HitResult.LargeTickHit);
        const smallTickHit = statistics.get(HitResult.SmallTickHit);
        const smallTickMiss = statistics.get(HitResult.SmallTickMiss);
        const miss = statistics.get(HitResult.Miss);

        statistics.set(
          HitResult.Great,
          totalHits - largeTickHit - smallTickHit - smallTickMiss - miss,
        );

        statistics.set(HitResult.LargeTickHit, largeTickHit + miss);

        break;
      }

      case GameMode.Mania: {
        const great = statistics.get(HitResult.Great);
        const good = statistics.get(HitResult.Good);
        const ok = statistics.get(HitResult.Ok);
        const meh = statistics.get(HitResult.Meh);

        statistics.set(HitResult.Perfect, totalHits - great - good - ok - meh);

        break;
      }

      default: {
        const ok = statistics.get(HitResult.Ok);
        const meh = statistics.get(HitResult.Meh);

        statistics.set(HitResult.Great, totalHits - ok - meh);
      }
    }

    statistics.set(HitResult.Miss, 0);

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
    const statistics = generateHitStatistics({ attributes });
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

    return score;
  }

  private _generateScoreInfo(options: Partial<IScoreInfo>): ScoreInfo {
    const scoreInfo = new ScoreInfo({
      id: options?.id ?? 0,
      beatmapId: options?.beatmapId ?? 0,
      userId: options?.userId ?? 0,
      username: options?.username ?? 'osu!',
      maxCombo: options?.maxCombo ?? 0,
      statistics: options?.statistics ?? new HitStatistics(),
      rawMods: options?.rawMods ?? 0,
      rulesetId: options?.rulesetId ?? 0,
      perfect: options?.perfect ?? false,
      beatmapHashMD5: options?.beatmapHashMD5,
      date: options?.date ?? new Date(),
      totalPerformance: options?.totalPerformance ?? null,
    });

    if (options?.mods) scoreInfo.mods = options.mods;

    scoreInfo.passed = scoreInfo.totalHits >= (options?.totalHits ?? 0);

    return scoreInfo;
  }
}
