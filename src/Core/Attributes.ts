import {
  Beatmap,
  type DifficultyAttributes,
  type PerformanceAttributes,
  type ModCombination,
} from 'osu-classes';

import type {
  IDifficultyCalculationOptions,
  IPerformanceCalculationOptions,
} from './Interfaces';
import { getRulesetById } from './Utils';

/**
 * Calculates difficulty attributes by ID, custom file or IBeatmap object.
 * @param options Difficulty attributes request options.
 * @returns Calculated difficulty attributes.
 */
export function calculateDifficulty(options: IDifficultyCalculationOptions): DifficultyAttributes {
  const { beatmap, ruleset, mods } = options;

  if (!beatmap || !ruleset) {
    throw new Error('Cannot calculate difficulty attributes');
  }

  const calculator = ruleset.createDifficultyCalculator(beatmap);

  if (typeof mods !== 'string' && typeof mods !== 'number') {
    return calculator.calculate();
  }

  const combination = ruleset.createModCombination(mods);

  return calculator.calculateWithMods(combination);
}

/**
 * Calculates difficulty attributes by ID, custom file or IBeatmap object.
 * @param options Difficulty attributes request options.
 * @returns Calculated difficulty attributes.
 */
export function calculatePerformance(options: IPerformanceCalculationOptions): PerformanceAttributes {
  const { difficulty, scoreInfo, ruleset } = options;

  if (!difficulty || !scoreInfo || !ruleset) {
    throw new Error('Cannot calculate performance attributes');
  }

  const calculator = ruleset.createPerformanceCalculator(difficulty, scoreInfo);

  return calculator.calculateAttributes();
}

/**
 * Filters mods from combination to get only difficulty mods.
 * @param ruleset Target ruleset ID.
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
