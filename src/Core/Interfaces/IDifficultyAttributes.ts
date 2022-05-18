/**
 * Raw difficulty attributes with no methods.
 */
export interface IDifficultyAttributes {
  /**
   * The combined star rating of all skill.
   */
  starRating: number;
  /**
   * The maximum achievable combo.
   */
  maxCombo: number;

  /**
   * Mod combination or bitwise.
   */
  mods: string | number;
}
