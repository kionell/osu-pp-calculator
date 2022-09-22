/**
 * Missing beatmap attributes that are required to simulate scores.
 */
export interface IBeatmapAttributes {
  /**
   * Beatmap ID.
   */
  beatmapId?: number;

  /**
   * Beatmap MD5 hash.
   */
  hash?: string;

  /**
   * Beatmap ruleset ID.
   */
  rulesetId?: number;

  /**
   * Mod combination or bitwise.
   */
  mods?: string | number;

  /**
   * Beatmap total hits.
   */
  totalHits?: number;

  /**
   * Beatmap max combo.
   */
  maxCombo?: number;

  /**
   * The number of fruits in osu!catch beatmap.
   */
  maxFruits?: number;

  /**
   * The number of droplets in osu!catch beatmap.
   */
  maxDroplets?: number;

  /**
   * The number of tiny droplets in osu!catch beatmap.
   */
  maxTinyDroplets?: number;
}
