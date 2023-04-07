import { IBeatmap, MathUtils, ModCombination } from 'osu-classes';
import { GameMode } from '../Enums';
import { IBeatmapCustomStats } from '../Interfaces';

function clampStats(value: number, hasDT = false): number {
  /**
   * This values are taken from osu!lazer's Difficulty Adjust mod.
   * I don't think it makes sense to change them as 
   * AR & OD formulas start to give weird values on >13.33.
   */
  const MIN_LIMIT = 0;
  const MAX_LIMIT = hasDT ? 11 : 10;

  return MathUtils.clamp(value, MIN_LIMIT, MAX_LIMIT);
}

function clampRate(value: number): number {
  const MIN_LIMIT = 0.25;
  const MAX_LIMIT = 10;

  return MathUtils.clamp(value, MIN_LIMIT, MAX_LIMIT);
}

function clampBPM(value: number): number {
  const MIN_LIMIT = 1;
  const MAX_LIMIT = 10000;

  return MathUtils.clamp(value, MIN_LIMIT, MAX_LIMIT);
}

/**
 * Overwrites circle size of a beatmap with custom one.
 * @param beatmap A beatmap.
 * @param mods Mod combination.
 * @param stats Custom difficulty stats.
 */
export function applyCustomCircleSize(
  beatmap: IBeatmap,
  mods: ModCombination,
  stats: IBeatmapCustomStats,
): void {
  if (typeof stats.circleSize !== 'number') return;

  /**
   * This is used to compensate CS scaling from mods.
   */
  const denominator = mods.has('HR') ? 1.3 : (mods.has('EZ') ? 0.5 : 1);
  const shouldLockCS = stats.lockStats || stats.lockCircleSize;

  beatmap.difficulty.circleSize = clampStats(
    shouldLockCS ? stats.circleSize / denominator : stats.circleSize,
  );
}

/**
 * Overwrites difficulty stats of a beatmap with custom difficulty stats.
 * @param beatmap A beatmap.
 * @param mods Mod combination.
 * @param stats Custom difficulty stats.
 */
export function applyCustomStats(
  beatmap: IBeatmap,
  mods: ModCombination,
  stats: IBeatmapCustomStats,
): void {
  const { clockRate, bpm } = stats;

  if (typeof clockRate === 'number') {
    beatmap.difficulty.clockRate = clampRate(clockRate);
  }
  // Ignore custom BPM with HT/DT mods as it can invert clock rate 
  else if (beatmap.difficulty.clockRate === 1 && typeof bpm === 'number') {
    // Clock rate set by BPM value may exceed the actual limit of clock rate.
    beatmap.difficulty.clockRate = clampBPM(bpm) / beatmap.bpmMode;
  }

  beatmap.difficulty.approachRate = getScaledAR(beatmap, mods, stats);
  beatmap.difficulty.overallDifficulty = getScaledOD(beatmap, mods, stats);
}

/**
 * Scales approach rate to compensate rate adjusting mods.
 * @param beatmap A beatmap.
 * @param mods Mod combination.
 * @param stats Custom difficulty stats.
 * @returns Scaled approach rate.
 */
function getScaledAR(
  beatmap: IBeatmap,
  mods: ModCombination,
  stats: IBeatmapCustomStats,
): number {
  if (typeof stats.approachRate !== 'number') {
    return beatmap.difficulty.approachRate;
  }

  const hasDT = mods.has('DT') || mods.has('NC');

  if (!stats.lockStats && !stats.lockApproachRate) {
    const multiplier = mods.has('HR') ? 1.4 : (mods.has('EZ') ? 0.5 : 1);

    return clampStats(stats.approachRate * multiplier, hasDT);
  }

  const newApproachRate = clampStats(stats.approachRate, hasDT);
  const adjustedRate = beatmap.difficulty.clockRate;

  switch (beatmap.mode) {
    case GameMode.Osu:
    case GameMode.Fruits: {
      const preemptMs = newApproachRate <= 5
        ? 1800 - newApproachRate * 120
        : 1200 - (newApproachRate - 5) * 150;

      const adjustedPreemptMs = preemptMs * adjustedRate;

      return adjustedPreemptMs <= 1200
        ? ((adjustedPreemptMs - 1200) * 5 / (450 - 1200)) + 5
        : 5 - ((adjustedPreemptMs - 1200) * 5 / (1800 - 1200));
    }
  }

  return newApproachRate;
}

/**
 * Scales overall difficulty to compensate rate adjusting mods.
 * @param beatmap A beatmap.
 * @param mods Mod combination.
 * @param stats Custom difficulty stats.
 * @returns Scaled overall difficulty.
 */
function getScaledOD(
  beatmap: IBeatmap,
  mods: ModCombination,
  stats: IBeatmapCustomStats,
): number {
  if (typeof stats.overallDifficulty !== 'number') {
    return beatmap.difficulty.overallDifficulty;
  }

  const hasDT = mods.has('DT') || mods.has('NC');

  if (!stats.lockStats && !stats.lockOverallDifficulty) {
    const multiplier = mods.has('HR') ? 1.4 : (mods.has('EZ') ? 0.5 : 1);

    return clampStats(stats.overallDifficulty * multiplier, hasDT);
  }

  const newOverallDifficulty = clampStats(stats.overallDifficulty, hasDT);
  const adjustedRate = beatmap.difficulty.clockRate;

  switch (beatmap.mode) {
    case GameMode.Osu: {
      // 80, 50, 20

      const hitWindowGreat = (80 - 6 * newOverallDifficulty);
      const adjustedHitWindowGreat = hitWindowGreat * adjustedRate;

      return adjustedHitWindowGreat <= 50
        ? ((adjustedHitWindowGreat - 50) * 5 / (20 - 50)) + 5
        : 5 - ((adjustedHitWindowGreat - 50) * 5 / (80 - 50));
    }

    case GameMode.Taiko: {
      return newOverallDifficulty;
    }
  }

  return newOverallDifficulty;
}
