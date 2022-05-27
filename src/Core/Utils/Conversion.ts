import { DifficultyAttributes } from 'osu-classes';
import { StandardDifficultyAttributes } from 'osu-standard-stable';
import { TaikoDifficultyAttributes } from 'osu-taiko-stable';
import { CatchDifficultyAttributes } from 'osu-catch-stable';
import { ManiaDifficultyAttributes } from 'osu-mania-stable';
import { IDifficultyAttributes } from '../Interfaces';
import { GameMode } from '../Enums';
import { getRulesetById } from './Ruleset';

/**
 * Converts raw difficulty attributes to real difficulty attributes.
 * @param difficulty Raw difficulty attributes.
 * @returns Difficulty attributes instance.
 */
export function toDifficultyAttributes(difficulty?: IDifficultyAttributes, rulesetId?: GameMode): DifficultyAttributes {
  const attributes = createAttributes(rulesetId, difficulty?.mods);

  if (typeof difficulty !== 'object') return attributes;

  for (const key in difficulty) {
    if (key in attributes) {
      (attributes as any)[key] = (difficulty as any)[key];
    }
  }

  return attributes;
}

function createAttributes(rulesetId?: GameMode, mods?: string | number): DifficultyAttributes {
  const ruleset = getRulesetById(rulesetId ?? GameMode.Osu);
  const combination = ruleset.createModCombination(mods);

  switch (ruleset.id) {
    case GameMode.Taiko: return new TaikoDifficultyAttributes(combination, 0);
    case GameMode.Fruits: return new CatchDifficultyAttributes(combination, 0);
    case GameMode.Mania: return new ManiaDifficultyAttributes(combination, 0);
  }

  return new StandardDifficultyAttributes(combination, 0);
}
