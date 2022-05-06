import {
  type IBeatmap,
  type IScoreInfo,
} from 'osu-classes';

import {
  type IBeatmapCalculationOptions,
  type ICalculatedBeatmap,
} from './Interfaces';

import {
  ScoreSimulator,
  parseBeatmap,
  calculateDifficulty,
  calculatePerformance,
  getRulesetById,
  GameMode,
} from '@Core';

/**
 * A beatmap calculator.
 */
export class BeatmapCalculator {
  /**
   * Instance of a score simulator.
   */
  private _scoreSimulator = new ScoreSimulator();

  /**
   * Calculates difficulty and performance of a beatmap.
   * @param options Beatmap calculation options.
   * @returns Calculated beatmap.
   */
  async calculate(options: IBeatmapCalculationOptions): Promise<ICalculatedBeatmap> {
    const parsed = options.beatmap ?? await parseBeatmap(options);
    const ruleset = options.ruleset ?? getRulesetById(options.rulesetId ?? parsed.mode);
    const combination = ruleset.createModCombination(options.mods);

    const beatmap = ruleset.applyToBeatmapWithMods(parsed, combination);
    const scores = this._simulateScores(beatmap, options.values);

    const difficulty = calculateDifficulty({ beatmap, ruleset });

    const performance = scores.map((scoreInfo) => calculatePerformance({
      difficulty,
      ruleset,
      scoreInfo,
    }));

    return {
      beatmap,
      difficulty,
      performance,
    };
  }

  /**
   * Simulates custom scores by accuracy or total score values.
   * @param beatmap IBeatmap object.
   * @param values Accuracy or total score values.
   * @returns Simulated scores.
   */
  private _simulateScores(beatmap: IBeatmap, values?: number[]): IScoreInfo[] {
    if (!values) return [];

    const isForMania = beatmap.mode === GameMode.Mania;

    return values.map((value) => this._scoreSimulator.simulate({
      beatmap,
      accuracy: isForMania ? 1 : value,
      totalScore: isForMania ? value : 0,
    }));
  }
}
