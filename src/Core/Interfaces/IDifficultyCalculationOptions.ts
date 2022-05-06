import { IBeatmap, IRuleset } from 'osu-classes';

export interface IDifficultyCalculationOptions {
  /**
   * An instance of any beatmap.
   */
  beatmap?: IBeatmap;

  /**
   * An instance of any ruleset.
   */
  ruleset: IRuleset;

  /**
   * Mod combination or bitwise. Default is NM.
   */
  mods?: string | number;
}
