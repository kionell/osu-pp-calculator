import {
  RulesetBeatmap,
  BeatmapInfo,
  IBeatmapInfo,
  IBeatmap,
  HitType,
  ModCombination,
  MathUtils,
} from 'osu-classes';

import {
  JuiceDroplet,
  JuiceFruit,
  JuiceTinyDroplet,
} from 'osu-catch-stable';

import { IBeatmapAttributes, IBeatmapCustomStats } from '../Interfaces';
import { GameMode } from '../Enums';

/**
 * Converts IBeatmap object to beatmap information.
 * @param beatmap IBeatmap object.
 * @param hash Beatmap MD5 hash.
 * @returns Converted beatmap info.
 */
export function createBeatmapInfo(beatmap?: IBeatmap, hash?: string): IBeatmapInfo {
  return new BeatmapInfo({
    id: beatmap?.metadata.beatmapId,
    beatmapsetId: beatmap?.metadata.beatmapSetId,
    creator: beatmap?.metadata.creator,
    title: beatmap?.metadata.title,
    artist: beatmap?.metadata.artist,
    version: beatmap?.metadata.version,
    hittable: countObjects(HitType.Normal, beatmap),
    slidable: countObjects(HitType.Slider, beatmap),
    spinnable: countObjects(HitType.Spinner, beatmap),
    holdable: countObjects(HitType.Hold, beatmap),
    length: (beatmap?.length ?? 0) / 1000,
    bpmMin: beatmap?.bpmMin,
    bpmMax: beatmap?.bpmMax,
    bpmMode: beatmap?.bpmMode,
    circleSize: beatmap?.difficulty.circleSize,
    approachRate: beatmap?.difficulty.approachRate,
    overallDifficulty: beatmap?.difficulty.overallDifficulty,
    drainRate: beatmap?.difficulty.drainRate,
    rulesetId: beatmap?.mode,
    mods: getMods(beatmap),
    maxCombo: getMaxCombo(beatmap),
    isConvert: beatmap?.originalMode !== beatmap?.mode,
    md5: hash ?? '',
  });
}

/**
 * Converts IBeatmap object to beatmap attributes.
 * @param beatmap IBeatmap object.
 * @returns Converted beatmap attributes.
 */
export function createBeatmapAttributes(beatmap?: IBeatmap): IBeatmapAttributes {
  const hittable = countObjects(HitType.Normal, beatmap);
  const maxTinyDroplets = countTinyDroplets(beatmap);
  const maxDroplets = countDroplets(beatmap) - maxTinyDroplets;
  const maxFruits = countFruits(beatmap) + hittable;

  const totalHits = beatmap?.mode === GameMode.Fruits
    ? maxFruits + maxDroplets + maxTinyDroplets
    : getTotalHits(beatmap);

  return {
    beatmapId: beatmap?.metadata.beatmapId,
    rulesetId: beatmap?.mode,
    mods: getMods(beatmap)?.toString() ?? 'NM',
    maxCombo: getMaxCombo(beatmap),
    totalHits,
    maxFruits,
    maxDroplets,
    maxTinyDroplets,
  };
}

/**
 * Overwrites difficulty stats of a beatmap with custom difficulty stats.
 * @param beatmap A beatmap.
 * @param stats Custom difficulty stats.
 */
export function applyCustomStats(beatmap: IBeatmap, stats: IBeatmapCustomStats): void {
  const { approachRate, overallDifficulty, circleSize, clockRate } = stats;

  const clampStats = (value: number): number => {
    const MIN_LIMIT = 0; // Min limit of Difficulty Adjust mod.
    const MAX_LIMIT = 11; // Max limit of Difficulty Adjust mod.

    return MathUtils.clamp(value, MIN_LIMIT, MAX_LIMIT);
  };

  const clampRate = (value: number): number => {
    const MIN_LIMIT = 0.5; // Min limit of Half Time mod.
    const MAX_LIMIT = 2.0; // Max limit of Double Time mod.

    return MathUtils.clamp(value, MIN_LIMIT, MAX_LIMIT);
  };

  if (typeof approachRate === 'number') {
    beatmap.difficulty.approachRate = clampStats(approachRate);
  }

  if (typeof overallDifficulty === 'number') {
    beatmap.difficulty.overallDifficulty = clampStats(overallDifficulty);
  }

  if (typeof circleSize === 'number') {
    beatmap.difficulty.circleSize = clampStats(circleSize);
  }

  if (typeof clockRate === 'number') {
    beatmap.difficulty.clockRate = clampRate(clockRate);
  }
}

/**
 * Counts the number of objects of the specific hit type.
 * @param hitType Hit type to be calculated.
 * @param beatmap IBeatmap object.
 * @returns Number of objects of this hit type.
 */
function countObjects(hitType: HitType, beatmap?: IBeatmap): number {
  if (!beatmap) return 0;

  return beatmap.hitObjects.reduce((sum, obj) => {
    return sum + (obj.hitType & hitType ? 1 : 0);
  }, 0);
}

/**
 * Counts the number of nested fruits in the beatmap.
 * @param beatmap IBeatmap object.
 * @returns Number of nested fruits.
 */
function countFruits(beatmap?: IBeatmap): number {
  return countNested(JuiceFruit, beatmap);
}

/**
 * Counts the number of nested droplets in the beatmap.
 * @param beatmap IBeatmap object.
 * @returns Number of nested droplets.
 */
function countDroplets(beatmap?: IBeatmap): number {
  return countNested(JuiceDroplet, beatmap);
}

/**
 * Counts the number of nested tiny droplets in the beatmap.
 * @param beatmap IBeatmap object.
 * @returns Number of nested tiny droplets.
 */
function countTinyDroplets(beatmap?: IBeatmap): number {
  return countNested(JuiceTinyDroplet, beatmap);
}

/**
 * Counts the number of nested objects that are instance of specific class.
 * @param Class Class of objects.
 * @param beatmap IBeatmap object.
 * @returns Number of nested hit objects that are instance of specific class.
 */
function countNested(Class: new () => any, beatmap?: IBeatmap): number {
  const rulesetBeatmap = beatmap as RulesetBeatmap;

  return rulesetBeatmap.hitObjects.reduce((sum, obj) => {
    const nestedSum = obj.nestedHitObjects?.reduce((sum, obj) => {
      return sum + (obj instanceof Class ? 1 : 0);
    }, 0);

    return sum + (nestedSum ?? 0);
  }, 0);
}

/**
 * Calculates total hits of a beatmap.
 * @param beatmap IBeatmap object.
 * @returns Total hits of a beatmap or 0.
 */
function getTotalHits(beatmap?: IBeatmap): number {
  if (!beatmap) return 0;

  switch (beatmap.mode) {
    case GameMode.Osu: {
      const circles = countObjects(HitType.Normal, beatmap);
      const sliders = countObjects(HitType.Slider, beatmap);
      const spinners = countObjects(HitType.Spinner, beatmap);

      return circles + sliders + spinners;
    }

    case GameMode.Taiko: {
      return countObjects(HitType.Normal, beatmap);
    }

    case GameMode.Fruits: {
      const hittable = countObjects(HitType.Normal, beatmap);
      const tinyDroplets = countTinyDroplets(beatmap);
      const droplets = countDroplets(beatmap) - tinyDroplets;
      const fruits = countFruits(beatmap) + hittable;

      return fruits + droplets + tinyDroplets;
    }

    case GameMode.Mania: {
      const notes = countObjects(HitType.Normal, beatmap);
      const holds = countObjects(HitType.Hold, beatmap);

      return notes + holds;
    }
  }

  const hittable = countObjects(HitType.Normal, beatmap);
  const slidable = countObjects(HitType.Slider, beatmap);
  const spinnable = countObjects(HitType.Spinner, beatmap);
  const holdable = countObjects(HitType.Hold, beatmap);

  return hittable + slidable + spinnable + holdable;
}

/**
 * Tries to get max combo of a beatmap.
 * @param beatmap IBeatmap object.
 * @returns Max combo of a beatmap or 0.
 */
function getMaxCombo(beatmap?: IBeatmap): number {
  return (beatmap as RulesetBeatmap)?.maxCombo ?? 0;
}

/**
 * Tries to get mod combination from IBeatmap object.
 * @param beatmap IBeatmap object.
 * @returns Mod combination or null.
 */
function getMods(beatmap?: IBeatmap): ModCombination | null {
  return (beatmap as RulesetBeatmap)?.mods ?? null;
}
