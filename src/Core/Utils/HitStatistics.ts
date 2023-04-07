import { HitResult, HitStatistics, MathUtils } from 'osu-classes';
import { IBeatmapAttributes } from '../Interfaces';
import { GameMode } from '../Enums';

interface IHitStatisticsInput {
  attributes: IBeatmapAttributes;
  accuracy?: number;
  countMiss?: number;
  count50?: number;
  count100?: number;
  count300?: number;
  countKatu?: number;
}

export function generateHitStatistics(options: IHitStatisticsInput): HitStatistics {
  switch (options.attributes.rulesetId) {
    case GameMode.Taiko:
      return generateTaikoHitStatistics(options);

    case GameMode.Fruits:
      return generateCatchHitStatistics(options);

    case GameMode.Mania:
      return generateManiaHitStatistics(options);
  }

  return generateOsuHitStatistics(options);
}

function generateOsuHitStatistics(options: IHitStatisticsInput): HitStatistics {
  const attributes = options.attributes;
  const accuracy = getAccuracy(options);
  const totalHits = attributes.totalHits ?? 0;

  let count50 = options.count50;
  let count100 = options.count100;
  let countMiss = options.countMiss ?? 0;

  countMiss = MathUtils.clamp(countMiss, 0, totalHits);
  count50 = count50 ? MathUtils.clamp(count50, 0, totalHits - countMiss) : 0;

  if (typeof count100 !== 'number') {
    count100 = Math.round((totalHits - totalHits * accuracy) * 1.5);
  }
  else {
    count100 = MathUtils.clamp(count100, 0, totalHits - count50 - countMiss);
  }

  const count300 = totalHits - count100 - count50 - countMiss;

  return new HitStatistics([
    [HitResult.Great, count300],
    [HitResult.Ok, count100],
    [HitResult.Meh, count50],
    [HitResult.Miss, countMiss],
  ]);
}

function generateTaikoHitStatistics(options: IHitStatisticsInput): HitStatistics {
  const attributes = options.attributes;
  const accuracy = getAccuracy(options);
  const totalHits = attributes.totalHits ?? 0;

  let count100 = options.count100;
  let countMiss = options.countMiss ?? 0;

  countMiss = MathUtils.clamp(countMiss, 0, totalHits);

  let count300;

  if (typeof count100 !== 'number') {
    const targetTotal = Math.round(accuracy * totalHits * 2);

    count300 = targetTotal - (totalHits - countMiss);
    count100 = totalHits - count300 - countMiss;
  }
  else {
    count100 = MathUtils.clamp(count100, 0, totalHits - countMiss);
    count300 = totalHits - count100 - countMiss;
  }

  return new HitStatistics([
    [HitResult.Great, count300],
    [HitResult.Ok, count100],
    [HitResult.Miss, countMiss],
  ]);
}

function generateCatchHitStatistics(options: IHitStatisticsInput): HitStatistics {
  const attributes = options.attributes;
  const accuracy = getAccuracy(options);
  const count50 = options.count50;
  const count100 = options.count100;

  let countMiss = options.countMiss ?? 0;

  const maxCombo = attributes.maxCombo ?? 0;
  const maxFruits = attributes.maxFruits ?? 0;
  const maxDroplets = attributes.maxDroplets ?? 0;
  const maxTinyDroplets = attributes.maxTinyDroplets ?? 0;

  countMiss = MathUtils.clamp(countMiss, 0, maxDroplets + maxFruits);

  let droplets = count100 ?? Math.max(0, maxDroplets - countMiss);

  droplets = MathUtils.clamp(droplets, 0, maxDroplets);

  const fruits = maxFruits - (countMiss - (maxDroplets - droplets));

  let tinyDroplets = Math.round(accuracy * (maxCombo + maxTinyDroplets));

  tinyDroplets = count50 ?? tinyDroplets - fruits - droplets;

  const tinyMisses = maxTinyDroplets - tinyDroplets;

  return new HitStatistics([
    [HitResult.Great, MathUtils.clamp(fruits, 0, maxFruits)],
    [HitResult.LargeTickHit, MathUtils.clamp(droplets, 0, maxDroplets)],
    [HitResult.SmallTickHit, tinyDroplets],
    [HitResult.SmallTickMiss, tinyMisses],
    [HitResult.Miss, countMiss],
  ]);
}

function generateManiaHitStatistics(options: IHitStatisticsInput): HitStatistics {
  const attributes = options.attributes;
  const accuracy = getAccuracy(options);
  const totalHits = attributes.totalHits ?? 0;

  let count300 = options.count300 ?? 0;
  let countKatu = options.countKatu ?? 0; // Goods (200)
  let count100 = options.count100 ?? 0;
  let count50 = options.count50;
  let countMiss = options.countMiss ?? 0;

  countMiss = MathUtils.clamp(countMiss, 0, totalHits);

  /**
   * Populate score with mehs to make this approximation more precise.
   * This value can be negative on impossible misscount.
   * 
   * total = ((1/6) * meh + (1/3) * ok + (2/3) * good + great + perfect) / acc
   * total = miss + meh + ok + good + great + perfect
   * 
   * miss + (5/6) * meh + (2/3) * ok + (1/3) * good = total - acc * total
   * meh = 1.2 * (total - acc * total) - 1.2 * miss - 0.8 * ok - 0.4 * good
   */
  count50 ??= Math.round(
    1.2 * (totalHits - totalHits * accuracy) - 0.8 * count100 - 0.4 * countKatu - 1.2 * countMiss,
  );

  /**
   * We need to clamp for all values because performance calculator's 
   * custom accuracy formula is not invariant to negative counts.
   */
  let currentCounts = countMiss;

  count50 = MathUtils.clamp(count50, 0, totalHits - currentCounts);
  currentCounts += count50;

  count100 = MathUtils.clamp(count100, 0, totalHits - currentCounts);
  currentCounts += count100;

  countKatu = MathUtils.clamp(countKatu, 0, totalHits - currentCounts);
  currentCounts += countKatu;

  count300 = MathUtils.clamp(count300, 0, totalHits - currentCounts);

  const countGeki = totalHits - count300 - countKatu - count100 - count50 - countMiss;

  return new HitStatistics([
    [HitResult.Perfect, countGeki],
    [HitResult.Great, count300],
    [HitResult.Good, countKatu],
    [HitResult.Ok, count100],
    [HitResult.Meh, count50],
    [HitResult.Miss, countMiss],
  ]);
}

function getAccuracy(options: IHitStatisticsInput): number {
  if (typeof options.accuracy !== 'number') return 1;

  let accuracy = options.accuracy;

  while (accuracy > 1) accuracy /= 100;

  return accuracy;
}
