import {
  IHitStatistics,
  IBeatmap,
  HitType,
} from 'osu-classes';

import {
  countFruits,
  countDroplets,
  countTinyDroplets,
  countObjects,
  getMaxCombo,
  getTotalHits,
} from './Beatmap';

import { GameMode } from '../Enums';

export function generateHitStatistics(beatmap: IBeatmap, accuracy = 1, countMiss = 0, count50?: number, count100?: number): Partial<IHitStatistics> {
  if (accuracy > 1) accuracy /= 100;

  switch (beatmap.mode) {
    case GameMode.Taiko:
      return generateTaikoHitStatistics(beatmap, accuracy, countMiss, count100);

    case GameMode.Fruits:
      return generateCatchHitStatistics(beatmap, accuracy, countMiss, count50, count100);

    case GameMode.Mania:
      return generateManiaHitStatistics(beatmap);
  }

  return generateOsuHitStatistics(beatmap, accuracy, countMiss, count50, count100);
}

function generateOsuHitStatistics(beatmap: IBeatmap, accuracy = 1, countMiss = 0, count50?: number, count100?: number): Partial<IHitStatistics> {
  const totalHits = getTotalHits(beatmap);

  countMiss = Math.min(Math.max(0, countMiss), totalHits);
  count50 = count50 ? Math.min(Math.max(0, count50), totalHits - countMiss) : 0;

  if (typeof count100 !== 'number') {
    count100 = Math.round((totalHits - totalHits * accuracy) * 1.5);
  }
  else {
    count100 = Math.min(Math.max(0, count100), totalHits - count50 - countMiss);
  }

  const count300 = totalHits - count100 - count50 - countMiss;

  return {
    great: count300,
    ok: count100,
    meh: count50 ?? 0,
    miss: countMiss,
  };
}

function generateTaikoHitStatistics(beatmap: IBeatmap, accuracy = 1, countMiss = 0, count100?: number): Partial<IHitStatistics> {
  const totalHits = getTotalHits(beatmap);

  countMiss = Math.max(0, Math.min(countMiss, totalHits));

  let count300;

  if (typeof count100 !== 'number') {
    const targetTotal = Math.round(accuracy * totalHits * 2);

    count300 = targetTotal - (totalHits - countMiss);
    count100 = totalHits - count300 - countMiss;
  }
  else {
    count100 = Math.min(Math.max(0, count100), totalHits - countMiss);
    count300 = totalHits - count100 - countMiss;
  }

  return {
    great: count300,
    ok: count100,
    miss: countMiss,
  };
}

function generateCatchHitStatistics(beatmap: IBeatmap, accuracy = 1, countMiss = 0, count50?: number, count100?: number): Partial<IHitStatistics> {
  // TODO: There is no way to get this data without parsing beatmap.
  const maxTinyDroplets = countTinyDroplets(beatmap);
  const maxDroplets = countDroplets(beatmap) - maxTinyDroplets;
  const maxFruits = countFruits(beatmap) + countObjects(beatmap, HitType.Normal);
  const maxCombo = getMaxCombo(beatmap);

  if (typeof count100 === 'number') {
    countMiss += maxDroplets - count100;
  }

  countMiss = Math.max(0, Math.min(countMiss, maxDroplets + maxFruits));

  let droplets = count100 ?? Math.max(0, maxDroplets - countMiss);

  droplets = Math.max(0, Math.min(droplets, maxDroplets));

  const fruits = maxFruits - (countMiss - (maxDroplets - droplets));

  let tinyDroplets = Math.round(accuracy * (maxCombo + maxTinyDroplets));

  tinyDroplets = count50 ?? tinyDroplets - fruits - droplets;

  const tinyMisses = maxTinyDroplets - tinyDroplets;

  return {
    great: Math.max(0, Math.min(fruits, maxFruits)),
    largeTickHit: Math.max(0, Math.min(droplets, maxDroplets)),
    smallTickHit: tinyDroplets,
    smallTickMiss: tinyMisses,
    miss: countMiss,
  };
}

function generateManiaHitStatistics(beatmap: IBeatmap): Partial<IHitStatistics> {
  return {
    perfect: getTotalHits(beatmap),
  };
}

export function getValidHitStatistics(original?: Partial<IHitStatistics>): IHitStatistics {
  return {
    perfect: original?.perfect ?? 0,
    great: original?.great ?? 0,
    good: original?.good ?? 0,
    ok: original?.ok ?? 0,
    meh: original?.meh ?? 0,
    largeTickHit: original?.largeTickHit ?? 0,
    smallTickMiss: original?.smallTickMiss ?? 0,
    smallTickHit: original?.smallTickHit ?? 0,
    miss: original?.miss ?? 0,
    largeBonus: 0,
    largeTickMiss: 0,
    smallBonus: 0,
    ignoreHit: 0,
    ignoreMiss: 0,
    none: 0,
  };
}
