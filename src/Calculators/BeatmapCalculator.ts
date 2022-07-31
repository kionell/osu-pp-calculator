import { IScoreInfo, StrainSkill } from 'osu-classes';
import { IBeatmapCalculationOptions, ICalculatedBeatmap } from './Interfaces';

import {
  ScoreSimulator,
  parseBeatmap,
  scaleTotalScore,
  createDifficultyCalculator,
  createBeatmapInfo,
  createBeatmapAttributes,
  calculateDifficulty,
  calculatePerformance,
  getRulesetById,
  GameMode,
  IBeatmapAttributes,
  toCombination,
  toDifficultyAttributes,
  IBeatmapSkill,
  IExtendedDifficultyCalculator,
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
    if (this._checkPrecalculated(options)) {
      return this._processPrecalculated(options);
    }

    const { data: parsed, hash: beatmapMD5 } = await parseBeatmap(options);

    const ruleset = options.ruleset ?? getRulesetById(options.rulesetId ?? parsed.mode);

    const combination = ruleset.createModCombination(options.mods);
    const beatmap = ruleset.applyToBeatmapWithMods(parsed, combination);

    const beatmapInfo = options.beatmapInfo ?? createBeatmapInfo(beatmap, beatmapMD5);
    const attributes = options.attributes ?? createBeatmapAttributes(beatmap);

    const calculator = createDifficultyCalculator(beatmap, ruleset);

    const difficulty = options.difficulty && !options.strains
      ? toDifficultyAttributes(options.difficulty, ruleset.id)
      : calculateDifficulty({ beatmap, ruleset, calculator });

    const skills = options.strains ? this._getSkillsOutput(calculator) : null;

    const scores = this._simulateScores(attributes, options);

    const performance = scores.map((scoreInfo) => calculatePerformance({
      difficulty,
      ruleset,
      scoreInfo,
    }));

    return {
      beatmapInfo: beatmapInfo?.toJSON() ?? beatmapInfo,
      attributes,
      skills,
      difficulty,
      performance,
    };
  }

  /**
   * This is the special case in which all precalculated stuff is present.
   * @param options Beatmap calculation options.
   * @returns Calculated beatmap.
   */
  private _processPrecalculated(options: IBeatmapCalculationOptions): ICalculatedBeatmap {
    const {
      beatmapInfo,
      attributes,
    } = options as Required<IBeatmapCalculationOptions>;

    const ruleset = options.ruleset ?? getRulesetById(attributes.rulesetId);
    const difficulty = toDifficultyAttributes(options.difficulty, ruleset.id);

    const scores = this._simulateScores(attributes, options);

    const performance = scores.map((scoreInfo) => calculatePerformance({
      difficulty,
      ruleset,
      scoreInfo,
    }));

    return {
      beatmapInfo: beatmapInfo?.toJSON() ?? beatmapInfo,
      skills: null,
      attributes,
      difficulty,
      performance,
    };
  }

  /**
   * Tests these beatmap calculation options for the possibility of skipping beatmap parsing. 
   * @param options Beatmap calculation options.
   * @returns If these options enough to skip beatmap parsing.
   */
  private _checkPrecalculated(options: IBeatmapCalculationOptions): boolean {
    return !!options.beatmapInfo
      && !!options.attributes
      && !!options.difficulty
      && !options.strains;
  }

  /**
   * Transforms skill data to get strain peaks.
   * @param calculator Extended difficulty calculator.
   * @returns Skill output data.
   */
  private _getSkillsOutput(calculator: IExtendedDifficultyCalculator): IBeatmapSkill[] {
    const skills = calculator.getSkills();
    const strainSkills = skills.filter((s) => s instanceof StrainSkill) as StrainSkill[];

    const output = strainSkills.map((skill) => {
      return {
        title: skill.constructor.name,
        strainPeaks: [...skill.getCurrentStrainPeaks()],
      };
    });

    // Rename one of two osu!standard aim skills.
    if (output[0]?.title === 'Aim' && output[1]?.title === 'Aim') {
      output[1].title = 'Aim (No Sliders)';
    }

    // Rename two osu!taiko stamina skills.
    if (output[2]?.title === 'Stamina' && output[3]?.title === 'Stamina') {
      output[2].title = 'Stamina (Left)';
      output[3].title = 'Stamina (Right)';
    }

    return output;
  }

  /**
   * Simulates custom scores by accuracy or total score values.
   * @param attributes Beatmap attributes.
   * @param options Beatmap calculation options.
   * @returns Simulated scores.
   */
  private _simulateScores(attributes: IBeatmapAttributes, options: IBeatmapCalculationOptions): IScoreInfo[] {
    return attributes.rulesetId === GameMode.Mania
      ? this._simulateManiaScores(attributes, options.totalScores)
      : this._simulateOtherScores(attributes, options.accuracy);
  }

  /**
   * Simulates custom scores by accuracy values.
   * @param attributes Beatmap attributes.
   * @param accuracy Accuracy values.
   * @returns Simulated scores.
   */
  private _simulateOtherScores(attributes: IBeatmapAttributes, accuracy?: number[]): IScoreInfo[] {
    /**
     * Default accuracy list for simulation.
     */
    accuracy ??= [ 95, 99, 100 ];

    return accuracy.map((accuracy) => this._scoreSimulator.simulate({
      attributes,
      accuracy,
    }));
  }

  /**
   * Simulates custom osu!mania scores by total score values.
   * @param attributes Beatmap attributes.
   * @param totalScores Total score values.
   * @returns Simulated osu!mania scores.
   */
  private _simulateManiaScores(attributes: IBeatmapAttributes, totalScores?: number[]): IScoreInfo[] {
    const mods = toCombination(attributes.mods, attributes.rulesetId);

    /**
     * Default total score list for simulation.
     */
    totalScores ??= [
      scaleTotalScore(8e5, mods),
      scaleTotalScore(9e5, mods),
      scaleTotalScore(1e6, mods),
    ];

    return totalScores.map((totalScore) => this._scoreSimulator.simulate({
      attributes,
      totalScore,
    }));
  }
}
