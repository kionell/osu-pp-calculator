import { DifficultyCalculator, IBeatmap, IRuleset, Skill } from 'osu-classes';
import { StandardDifficultyAttributes, StandardDifficultyCalculator, StandardModCombination } from 'osu-standard-stable';
import { TaikoDifficultyAttributes, TaikoDifficultyCalculator, TaikoModCombination } from 'osu-taiko-stable';
import { CatchDifficultyAttributes, CatchDifficultyCalculator, CatchModCombination } from 'osu-catch-stable';
import { ManiaDifficultyAttributes, ManiaDifficultyCalculator, ManiaModCombination } from 'osu-mania-stable';
import { GameMode } from './Enums';

/**
 * Difficulty calculator that can return skill data.
 */
export interface IExtendedDifficultyCalculator extends DifficultyCalculator {
  /**
   * Get current skill list.
   */
  getSkills(): Skill[];
}

/**
 * Difficulty calculator for osu!standard ruleset that can return skill data.
 */
class ExtendedStandardDifficultyCalculator extends StandardDifficultyCalculator implements IExtendedDifficultyCalculator {
  /**
   * List of skills.
   */
  private _skills: Skill[] = [];

  getSkills(): Skill[] {
    return this._skills;
  }

  protected _createDifficultyAttributes(beatmap: IBeatmap, mods: StandardModCombination, skills: Skill[]): StandardDifficultyAttributes {
    this._skills = skills;

    return super._createDifficultyAttributes(beatmap, mods, skills);
  }
}

/**
 * Difficulty calculator for osu!taiko ruleset that can return skill data.
 */
class ExtendedTaikoDifficultyCalculator extends TaikoDifficultyCalculator implements IExtendedDifficultyCalculator {
  /**
   * List of skills.
   */
  private _skills: Skill[] = [];

  getSkills(): Skill[] {
    return this._skills;
  }

  protected _createDifficultyAttributes(beatmap: IBeatmap, mods: TaikoModCombination, skills: Skill[]): TaikoDifficultyAttributes {
    this._skills = skills;

    return super._createDifficultyAttributes(beatmap, mods, skills);
  }
}

/**
 * Difficulty calculator for osu!catch ruleset that can return skill data.
 */
class ExtendedCatchDifficultyCalculator extends CatchDifficultyCalculator implements IExtendedDifficultyCalculator {
  /**
   * List of skills.
   */
  private _skills: Skill[] = [];

  getSkills(): Skill[] {
    return this._skills;
  }

  protected _createDifficultyAttributes(beatmap: IBeatmap, mods: CatchModCombination, skills: Skill[]): CatchDifficultyAttributes {
    this._skills = skills;

    return super._createDifficultyAttributes(beatmap, mods, skills);
  }
}

/**
 * Difficulty calculator for osu!mania ruleset that can return skill data.
 */
class ExtendedManiaDifficultyCalculator extends ManiaDifficultyCalculator implements IExtendedDifficultyCalculator {
  /**
   * List of skills.
   */
  private _skills: Skill[] = [];

  getSkills(): Skill[] {
    return this._skills;
  }

  protected _createDifficultyAttributes(beatmap: IBeatmap, mods: ManiaModCombination, skills: Skill[]): ManiaDifficultyAttributes {
    this._skills = skills;

    return super._createDifficultyAttributes(beatmap, mods, skills);
  }
}

/**
 * Factory of extended difficulty calculators.
 * @param beatmap IBeatmap object.
 * @param ruleset Ruleset instance.
 * @returns Instance of extended difficulty calculator.
 */
export function createDifficultyCalculator(beatmap: IBeatmap, ruleset: IRuleset): IExtendedDifficultyCalculator {
  switch (ruleset.id) {
    case GameMode.Osu:
      return new ExtendedStandardDifficultyCalculator(beatmap, ruleset);

    case GameMode.Taiko:
      return new ExtendedTaikoDifficultyCalculator(beatmap, ruleset);

    case GameMode.Fruits:
      return new ExtendedCatchDifficultyCalculator(beatmap, ruleset);

    case GameMode.Mania:
      return new ExtendedManiaDifficultyCalculator(beatmap, ruleset);
  }

  throw new Error('This ruleset does not support strain output!');
}
