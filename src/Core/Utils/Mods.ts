import { Beatmap, ModCombination } from 'osu-classes';
import { getRulesetById } from './Ruleset';

/**
 * Filters mods from combination to get only difficulty mods.
 * @param rulesetId Target ruleset ID.
 * @param mods Original mods.
 * @returns Difficulty mods.
 */
export function getDifficultyMods(rulesetId: number, mods: string | number): ModCombination {
  const ruleset = getRulesetById(rulesetId);
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
 * @param rulesetId Target ruleset ID.
 * @param mods Original mods.
 * @returns Difficulty mods.
 */
export function toCombination(rulesetId: number, mods: string | number): string {
  const ruleset = getRulesetById(rulesetId);
  const combination = ruleset.createModCombination(mods);

  return combination.toString();
}
