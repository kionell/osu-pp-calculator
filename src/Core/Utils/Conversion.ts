import { DifficultyAttributes, IJsonableScoreInfo, IScoreInfo, ScoreInfo } from 'osu-classes';
import { StandardDifficultyAttributes } from 'osu-standard-stable';
import { TaikoDifficultyAttributes } from 'osu-taiko-stable';
import { CatchDifficultyAttributes } from 'osu-catch-stable';
import { ManiaDifficultyAttributes } from 'osu-mania-stable';
import { getRulesetById } from './Ruleset';
import { toCombination } from './Mods';
import { IDifficultyAttributes } from '../Interfaces';
import { GameMode } from '../Enums';

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
export function toScoreInfo(data?: IScoreInfo | IJsonableScoreInfo): ScoreInfo {
  const scoreInfo = new ScoreInfo();

  if ((data as IScoreInfo)?.toJSON) return scoreInfo;

  const jsonable = data as IJsonableScoreInfo;

  scoreInfo.id = jsonable?.id;
  scoreInfo.totalScore = jsonable?.totalScore;
  scoreInfo.pp = jsonable?.pp;
  scoreInfo.maxCombo = jsonable?.maxCombo;
  scoreInfo.passed = jsonable?.passed;
  scoreInfo.perfect = jsonable?.perfect;
  scoreInfo.rank = jsonable?.rank;
  scoreInfo.accuracy = jsonable?.accuracy;
  scoreInfo.username = jsonable?.username;
  scoreInfo.userId = jsonable?.userId;
  scoreInfo.beatmapId = jsonable?.beatmapId;
  scoreInfo.date = jsonable?.date;
  scoreInfo.beatmapHashMD5 = jsonable?.beatmapHashMD5;
  scoreInfo.rulesetId = jsonable?.rulesetId;
  scoreInfo.mods = toCombination(jsonable.mods, jsonable.rulesetId);
  scoreInfo.countGeki = jsonable?.countGeki;
  scoreInfo.count300 = jsonable?.count300;
  scoreInfo.countKatu = jsonable?.countKatu;
  scoreInfo.count100 = jsonable?.count100;
  scoreInfo.count50 = jsonable?.count50;
  scoreInfo.countMiss = jsonable?.countMiss;

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
