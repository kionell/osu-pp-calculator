import {
  type RulesetBeatmap,
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
  scaleTotalScore,
  createBeatmapInfoFromBeatmap,
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
    const { data: parsed, hash: beatmapMD5 } = await parseBeatmap(options);

    const ruleset = options.ruleset ?? getRulesetById(options.rulesetId ?? parsed.mode);
    const combination = ruleset.createModCombination(options.mods);

    const beatmap = ruleset.applyToBeatmapWithMods(parsed, combination);
    const difficulty = options.difficulty ?? calculateDifficulty({ beatmap, ruleset });

    const scores = this._simulateScores(beatmap, options);

    const performance = scores.map((scoreInfo) => calculatePerformance({
      difficulty,
      ruleset,
      scoreInfo,
    }));

    const beatmapInfo = createBeatmapInfoFromBeatmap(beatmap, beatmapMD5).toJSON();

    return {
      beatmapInfo,
      difficulty,
      performance,
    };
  }

  /**
   * Simulates custom scores by accuracy or total score values.
   * @param beatmap IBeatmap object.
   * @param options Beatmap calculation options.
   * @returns Simulated scores.
   */
  private _simulateScores(beatmap: IBeatmap, options: IBeatmapCalculationOptions): IScoreInfo[] {
    return beatmap.mode === GameMode.Mania
      ? this._simulateManiaScores(beatmap, options.totalScores)
      : this._simulateOtherScores(beatmap, options.accuracy);
  }

  /**
   * Simulates custom scores by accuracy values.
   * @param beatmap IBeatmap object.
   * @param options Accuracy values.
   * @returns Simulated scores.
   */
  private _simulateOtherScores(beatmap: IBeatmap, accuracy?: number[]): IScoreInfo[] {
    /**
     * Default accuracy list for simulation.
     */
    accuracy ??= [ 95, 97, 99, 100 ];

    return accuracy.map((accuracy) => this._scoreSimulator.simulate({
      beatmap,
      accuracy,
    }));
  }

  /**
   * Simulates custom osu!mania scores by total score values.
   * @param beatmap IBeatmap object.
   * @param totalScores Total score values.
   * @returns Simulated osu!mania scores.
   */
  private _simulateManiaScores(beatmap: IBeatmap, totalScores?: number[]): IScoreInfo[] {
    const mods = (beatmap as RulesetBeatmap).mods;

    /**
     * Default total score list for simulation.
     */
    totalScores ??= [
      scaleTotalScore(7e5, mods),
      scaleTotalScore(8e5, mods),
      scaleTotalScore(9e5, mods),
      scaleTotalScore(1e6, mods),
    ];

    return totalScores.map((totalScore) => this._scoreSimulator.simulate({
      beatmap,
      totalScore,
    }));
  }
}
