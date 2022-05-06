import { StandardRuleset } from 'osu-standard-stable';
import { TaikoRuleset } from 'osu-taiko-stable';
import { CatchRuleset } from 'osu-catch-stable';
import { ManiaRuleset } from 'osu-mania-stable';
import type { IRuleset } from 'osu-classes';
import { GameMode } from '../Enums';

/**
 * Converts ruleset name to ruleset ID.
 * @param rulesetName Ruleset name.
 * @returns Ruleset ID.
 */
export function getRulesetIdByName(rulesetName?: string): GameMode {
  switch (rulesetName?.toLowerCase()) {
    case 'standard':
    case 'std':
    case 'osu': return GameMode.Osu;
    case 'taiko': return GameMode.Taiko;
    case 'ctb':
    case 'catch':
    case 'fruits': return GameMode.Fruits;
    case 'mania': return GameMode.Mania;
  }

  throw new Error('Unknown ruleset!');
}

/**
 * Creates a new ruleset instance by its ID.
 * @param rulesetId Ruleset ID.
 * @returns Ruleset instance.
 */
export function getRulesetById(rulesetId?: number): IRuleset {
  switch (rulesetId) {
    case GameMode.Osu: return new StandardRuleset();
    case GameMode.Taiko: return new TaikoRuleset();
    case GameMode.Fruits: return new CatchRuleset();
    case GameMode.Mania: return new ManiaRuleset();
  }

  throw new Error('Unknown ruleset!');
}
