import {
  RulesetBeatmap,
  BeatmapInfo,
  IBeatmapInfo,
  IBeatmap,
  HitType,
  ModCombination,
} from 'osu-classes';

import {
  JuiceDroplet,
  JuiceFruit,
  JuiceTinyDroplet,
} from 'osu-catch-stable';

import { GameMode } from '../Enums';

/**
 * Converts beatmap to beatmap information.
 * @param beatmap IBeatmap object.
 * @param hash Beatmap MD5 hash.
 * @returns Converted beatmap info.
 */
export function createBeatmapInfoFromBeatmap(beatmap: IBeatmap, hash?: string): IBeatmapInfo {
  const rulesetBeatmap = beatmap as RulesetBeatmap;

  return new BeatmapInfo({
    id: beatmap.metadata.beatmapId,
    beatmapsetId: beatmap.metadata.beatmapSetId,
    creator: beatmap.metadata.creator,
    title: beatmap.metadata.title,
    artist: beatmap.metadata.artist,
    version: beatmap.metadata.version,
    hittable: countObjects(beatmap, HitType.Normal),
    slidable: countObjects(beatmap, HitType.Slider),
    spinnable: countObjects(beatmap, HitType.Spinner),
    holdable: countObjects(beatmap, HitType.Hold),
    length: beatmap.length / 1000,
    bpmMin: beatmap.bpmMin,
    bpmMax: beatmap.bpmMax,
    bpmMode: beatmap.bpmMode,
    circleSize: beatmap.difficulty.circleSize,
    approachRate: beatmap.difficulty.approachRate,
    overallDifficulty: beatmap.difficulty.overallDifficulty,
    drainRate: beatmap.difficulty.drainRate,
    rulesetId: beatmap.mode,
    mods: rulesetBeatmap.mods ?? null,
    maxCombo: rulesetBeatmap.maxCombo ?? 0,
    isConvert: beatmap.originalMode !== beatmap.mode,
    md5: hash ?? '',
  });
}

/**
 * Counts the number of objects of the specific hit type.
 * @param beatmap IBeatmap object.
 * @param hitType Hit type to be calculated.
 * @returns Number of objects of this hit type.
 */
export function countObjects(beatmap: IBeatmap, hitType: HitType): number {
  return beatmap.hitObjects.reduce((sum, obj) => {
    return sum + (obj.hitType & hitType ? 1 : 0);
  }, 0);
}

/**
 * Counts the number of nested fruits in the beatmap.
 * @param beatmap IBeatmap object.
 * @returns Number of nested fruits.
 */
export function countFruits(beatmap: IBeatmap): number {
  return countNested(beatmap, JuiceFruit);
}

/**
 * Counts the number of nested droplets in the beatmap.
 * @param beatmap IBeatmap object.
 * @returns Number of nested droplets.
 */
export function countDroplets(beatmap: IBeatmap): number {
  return countNested(beatmap, JuiceDroplet);
}

/**
 * Counts the number of nested tiny droplets in the beatmap.
 * @param beatmap IBeatmap object.
 * @returns Number of nested tiny droplets.
 */
export function countTinyDroplets(beatmap: IBeatmap): number {
  return countNested(beatmap, JuiceTinyDroplet);
}

/**
 * Counts the number of nested objects that are instance of specific class.
 * @param beatmap IBeatmap object.
 * @param Class Class of objects.
 * @returns Number of nested hit objects that are instance of specific class.
 */
function countNested(beatmap: IBeatmap, Class: new () => any): number {
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
export function getTotalHits(beatmap: IBeatmap): number {
  switch (beatmap.mode) {
    case GameMode.Osu: {
      const circles = countObjects(beatmap, HitType.Normal);
      const sliders = countObjects(beatmap, HitType.Slider);
      const spinners = countObjects(beatmap, HitType.Spinner);

      return circles + sliders + spinners;
    }

    case GameMode.Taiko: {
      return countObjects(beatmap, HitType.Normal);
    }

    case GameMode.Fruits: {
      const tinyDroplets = countNested(beatmap, JuiceTinyDroplet);
      const droplets = countNested(beatmap, JuiceDroplet) - tinyDroplets;
      const fruits = countNested(beatmap, JuiceFruit)
        + countObjects(beatmap, HitType.Normal);

      return fruits + droplets + tinyDroplets;
    }

    case GameMode.Mania: {
      const notes = countObjects(beatmap, HitType.Normal);
      const holds = countObjects(beatmap, HitType.Hold);

      return notes + holds;
    }
  }

  const hittable = countObjects(beatmap, HitType.Normal);
  const slidable = countObjects(beatmap, HitType.Slider);
  const spinnable = countObjects(beatmap, HitType.Spinner);
  const holdable = countObjects(beatmap, HitType.Hold);

  return hittable + slidable + spinnable + holdable;
}

/**
 * Tries to get max combo of a beatmap.
 * @param beatmap IBeatmap object.
 * @returns Max combo of a beatmap or 0.
 */
export function getMaxCombo(beatmap: IBeatmap): number {
  const rulesetBeatmap = beatmap as RulesetBeatmap;

  return rulesetBeatmap.maxCombo ?? 0;
}

/**
 * Tries to get mod combination from IBeatmap object.
 * @param beatmap IBeatmap object.
 * @returns Mod combination or null.
 */
export function getMods(beatmap: IBeatmap): ModCombination | null {
  const rulesetBeatmap = beatmap as RulesetBeatmap;

  return rulesetBeatmap.mods ?? null;
}
