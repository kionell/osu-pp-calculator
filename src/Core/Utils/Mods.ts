import { Beatmap, ModCombination } from 'osu-classes';
import { GameMode } from '../Enums';
import { getRulesetById } from './Ruleset';

/**
 * Filters mods from combination to get only difficulty mods.
 * @param mods Original mods.
 * @param rulesetId Target ruleset ID.
 * @returns Difficulty mods.
 */
export function toDifficultyMods(mods?: string | number, rulesetId?: number): ModCombination {
  const ruleset = getRulesetById(rulesetId ?? GameMode.Osu);
  const difficultyCalculator = ruleset.createDifficultyCalculator(new Beatmap());
  const difficultyMods = difficultyCalculator.difficultyMods;
  const combination = ruleset.createModCombination(mods);

  const difficultyBitwise = combination.all.reduce((bitwise, mod) => {
    const found = difficultyMods.find((m) => {
      if (m.bitwise === mod.bitwise) return true;

      // Special case for DT/NC.
      return m.acronym === 'DT' && mod.acronym === 'NC';
    });

    return bitwise + (found?.bitwise ?? 0);
  }, 0);

  return ruleset.createModCombination(difficultyBitwise);
}

/**
 * Converts unknown input to mod combination.
 * @param input Original input.
 * @param rulesetId Target ruleset ID.
 * @returns Mod combination.
 */
export function toCombination(input?: string | number, rulesetId?: number): ModCombination {
  const ruleset = getRulesetById(rulesetId ?? GameMode.Osu);

  return ruleset.createModCombination(input);
}
