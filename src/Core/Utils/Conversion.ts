import { DifficultyAttributes, IJsonableScoreInfo, IScoreInfo, ScoreInfo } from 'osu-classes';
import { StandardDifficultyAttributes } from 'osu-standard-stable';
import { TaikoDifficultyAttributes } from 'osu-taiko-stable';
import { CatchDifficultyAttributes } from 'osu-catch-stable';
import { ManiaDifficultyAttributes } from 'osu-mania-stable';
import { IDifficultyAttributes } from '../Interfaces';
import { GameMode } from '../Enums';
import { getRulesetById } from './Ruleset';

/**
 * Converts raw difficulty attributes to real difficulty attributes.
 * @param difficulty Raw difficulty attributes.
 * @returns Difficulty attributes instance.
 */
export function toDifficultyAttributes(difficulty?: IDifficultyAttributes, rulesetId?: GameMode): DifficultyAttributes {
  const attributes = createAttributes(rulesetId, difficulty?.mods);

  if (typeof difficulty !== 'object') return attributes;

  for (const key in difficulty) {
    if (key in attributes) {
      (attributes as any)[key] = (difficulty as any)[key];
    }
  }

  return attributes;
}

/**
 * Converts score information object to score information instance.
 * @param jsonable Raw score info data.
 * @returns Converted score information.
 */
export function toScoreInfo(jsonable?: IScoreInfo | IJsonableScoreInfo): IScoreInfo {
  const scoreInfo = new ScoreInfo();

  if ((jsonable as IScoreInfo)?.rawMods) return scoreInfo;

  const data = jsonable as IJsonableScoreInfo;

  scoreInfo.id = data?.id;
  scoreInfo.totalScore = data?.totalScore;
  scoreInfo.pp = data?.pp;
  scoreInfo.maxCombo = data?.maxCombo;
  scoreInfo.passed = data?.passed;
  scoreInfo.perfect = data?.perfect;
  scoreInfo.rank = data?.rank;
  scoreInfo.accuracy = data?.accuracy;
  scoreInfo.username = data?.username;
  scoreInfo.userId = data?.userId;
  scoreInfo.beatmapId = data?.beatmapId;
  scoreInfo.date = data?.date;
  scoreInfo.beatmapHashMD5 = data?.beatmapHashMD5;
  scoreInfo.rulesetId = data?.rulesetId;
  scoreInfo.rawMods = data?.mods;
  scoreInfo.countGeki = data?.countGeki;
  scoreInfo.count300 = data?.count300;
  scoreInfo.countKatu = data?.countKatu;
  scoreInfo.count100 = data?.count100;
  scoreInfo.count50 = data?.count50;
  scoreInfo.countMiss = data?.countMiss;

  return scoreInfo;
}

function createAttributes(rulesetId?: GameMode, mods?: string | number): DifficultyAttributes {
  const ruleset = getRulesetById(rulesetId ?? GameMode.Osu);
  const combination = ruleset.createModCombination(mods);

  switch (ruleset.id) {
    case GameMode.Taiko: return new TaikoDifficultyAttributes(combination, 0);
    case GameMode.Fruits: return new CatchDifficultyAttributes(combination, 0);
    case GameMode.Mania: return new ManiaDifficultyAttributes(combination, 0);
  }

  return new StandardDifficultyAttributes(combination, 0);
}
