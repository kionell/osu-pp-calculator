import { Beatmap, ModCombination } from 'osu-classes';
import { GameMode } from '../Enums';
import { getRulesetById } from './Ruleset';

/**
 * Filters mods from combination to get only difficulty mods.
 * @param mods Original mods.
 * @param rulesetId Target ruleset ID.
 * @returns Difficulty mods.
 */
export function getDifficultyMods(mods?: string | number, rulesetId?: number): ModCombination {
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
 * Converts unknown input to stringified mod combination.
 * @param mods Original mods.
 * @param rulesetId Target ruleset ID.
 * @returns Stringified mod combination.
 */
export function toCombination(mods?: string | number, rulesetId?: number): string {
  const ruleset = getRulesetById(rulesetId ?? GameMode.Osu);
  const combination = ruleset.createModCombination(mods);

  return combination.toString();
}
