import { IScoreInfo, Skill, StrainSkill } from 'osu-classes';
import { Peaks } from 'osu-taiko-stable';
import { IBeatmapCalculationOptions, ICalculatedBeatmap } from './Interfaces';

import {
  ScoreSimulator,
  parseBeatmap,
  createDifficultyCalculator,
  createBeatmapInfo,
  createBeatmapAttributes,
  calculateDifficulty,
  calculatePerformance,
  getRulesetById,
  IBeatmapAttributes,
  toDifficultyAttributes,
  IBeatmapSkill,
  IExtendedDifficultyCalculator,
  applyCustomStats,
  applyCustomCircleSize,
} from '../Core';

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

    /**
     * Apply custom circle size before applying ruleset & mods.
     * Circle size actually affects the conversion process.
     */
    applyCustomCircleSize(parsed, combination, options);

    const beatmap = ruleset.applyToBeatmapWithMods(parsed, combination);

    /**
     * Apply custom beatmap stats after applying ruleset & mods
     * to ignore clock rate mods (DT, NC, HT...).
     */
    applyCustomStats(beatmap, options);

    const beatmapInfo = options.beatmapInfo ?? createBeatmapInfo(beatmap, beatmapMD5);
    const attributes = options.attributes ?? createBeatmapAttributes(beatmap);
    const totalHits = options.totalHits;

    const calculator = createDifficultyCalculator(beatmap, ruleset);

    const difficulty = options.difficulty && !options.strains
      ? toDifficultyAttributes(options.difficulty, ruleset.id)
      : calculateDifficulty({ beatmap, ruleset, calculator, totalHits });

    const skills = options.strains ? this._getSkillsOutput(calculator) : null;

    const scores = this._simulateScores(attributes, options.accuracy);

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

    const scores = this._simulateScores(attributes, options.accuracy);

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
    const isValid = !!options.beatmapInfo
      && !!options.attributes
      && !!options.difficulty
      && !options.strains;

    if (options.attributes && typeof options.totalHits === 'number') {
      return isValid && options.attributes.totalHits === options.totalHits;
    }

    return isValid;
  }

  /**
   * Transforms skill data to get strain peaks.
   * @param calculator Extended difficulty calculator.
   * @returns Skill output data.
   */
  private _getSkillsOutput(calculator: IExtendedDifficultyCalculator): IBeatmapSkill[] {
    const getStrainSkillOutput = (skills: Skill[]) => {
      const strainSkills = skills.filter((s) => s instanceof StrainSkill) as StrainSkill[];

      return strainSkills.map((skill) => {
        return {
          title: skill.constructor.name,
          strainPeaks: [...skill.getCurrentStrainPeaks()],
        };
      });
    };

    const mainSkills = calculator.getSkills();

    // Get inner skill data from osu!taiko peaks skill.
    if (mainSkills.length > 0 && mainSkills[0] instanceof Peaks) {
      const peakSkill = mainSkills[0] as Peaks;

      return getStrainSkillOutput([
        peakSkill.rhythm,
        peakSkill.colour,
        peakSkill.stamina,
      ]);
    }

    const skillOutput = getStrainSkillOutput(mainSkills);

    // Rename one of two osu!standard aim skills.
    if (skillOutput[0]?.title === 'Aim' && skillOutput[1]?.title === 'Aim') {
      skillOutput[1].title = 'Aim (No Sliders)';
    }

    return skillOutput;
  }

  /**
   * Simulates custom scores by accuracy values.
   * @param attributes Beatmap attributes.
   * @param accuracy Accuracy values.
   * @returns Simulated scores.
   */
  private _simulateScores(attributes: IBeatmapAttributes, accuracy?: number[]): IScoreInfo[] {
    /**
     * Default accuracy list for simulation.
     */
    accuracy ??= [ 95, 99, 100 ];

    return accuracy.map((accuracy) => this._scoreSimulator.simulate({
      attributes,
      accuracy,
    }));
  }
}
