import type {
  DifficultyAttributes,
  PerformanceAttributes,
} from 'osu-classes';

import type {
  IDifficultyCalculationOptions,
  IPerformanceCalculationOptions,
} from './Interfaces';

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

  const castedDifficulty = difficulty as DifficultyAttributes;
  const calculator = ruleset.createPerformanceCalculator(castedDifficulty, scoreInfo);

  return calculator.calculateAttributes();
}
