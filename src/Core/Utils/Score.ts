import { IScoreInfo, ScoreRank } from 'osu-classes';
import { GameMode } from '../Enums';

/**
 * Calculates accuracy of a score.
 * @param scoreInfo Score information.
 * @returns Calculated accuracy.
 */
export function calculateAccuracy(scoreInfo: IScoreInfo): number {
  const geki = scoreInfo.countGeki;
  const katu = scoreInfo.countKatu;
  const c300 = scoreInfo.count300;
  const c100 = scoreInfo.count100;
  const c50 = scoreInfo.count50;
  const total = scoreInfo.totalHits || calculateTotalHits(scoreInfo);

  if (total <= 0) return 1;

  switch (scoreInfo.rulesetId) {
    case GameMode.Osu:
      return Math.max(0, (c50 / 6 + c100 / 3 + c300) / total);

    case GameMode.Taiko:
      return Math.max(0, (c100 / 2 + c300) / total);

    case GameMode.Fruits:
      return Math.max(0, (c50 + c100 + c300) / total);

    case GameMode.Mania:
      return Math.max(0, (c50 / 6 + c100 / 3 + katu / 1.5 + (c300 + geki)) / total);
  }

  return 1;
}

/**
 * Calculates total hits of a score.
 * @param scoreInfo Score information.
 * @returns Calculated total hits.
 */
export function calculateTotalHits(scoreInfo: IScoreInfo): number {
  const geki = scoreInfo.countGeki;
  const katu = scoreInfo.countKatu;
  const c300 = scoreInfo.count300;
  const c100 = scoreInfo.count100;
  const c50 = scoreInfo.count50;
  const misses = scoreInfo.countMiss;

  switch (scoreInfo.rulesetId) {
    case GameMode.Osu:
      return c300 + c100 + c50 + misses;

    case GameMode.Taiko:
      return c300 + c100 + c50 + misses;

    case GameMode.Fruits:
      return c300 + c100 + c50 + misses + katu;

    case GameMode.Mania:
      return c300 + c100 + c50 + misses + geki + katu;
  }

  return c300 + c100 + c50 + misses + geki + katu;
}

/**
 * Calculates rank of a score.
 * @param scoreInfo Score information.
 * @returns Calculated score rank.
 */
export function calculateRank(scoreInfo: IScoreInfo): ScoreRank {
  if (!scoreInfo.passed) return ScoreRank.F;

  switch (scoreInfo.rulesetId) {
    case GameMode.Osu: return calculateOsuRank(scoreInfo);
    case GameMode.Taiko: return calculateTaikoRank(scoreInfo);
    case GameMode.Fruits: return calculateCatchRank(scoreInfo);
    case GameMode.Mania: return calculateManiaRank(scoreInfo);
  }

  return ScoreRank.F;
}

/**
 * Calculates rank of an osu!std score.
 * @param scoreInfo Score information.
 * @returns Calculated osu!std score rank.
 */
function calculateOsuRank(scoreInfo: IScoreInfo): ScoreRank {
  const hasFL = scoreInfo.mods?.has('FL') ?? false;
  const hasHD = scoreInfo.mods?.has('HD') ?? false;

  const ratio300 = Math.fround(scoreInfo.count300 / scoreInfo.totalHits);
  const ratio50 = Math.fround(scoreInfo.count50 / scoreInfo.totalHits);

  if (ratio300 === 1) {
    return hasHD || hasFL ? ScoreRank.XH : ScoreRank.X;
  }

  if (ratio300 > 0.9 && ratio50 <= 0.01 && scoreInfo.countMiss === 0) {
    return hasHD || hasFL ? ScoreRank.SH : ScoreRank.S;
  }

  if ((ratio300 > 0.8 && scoreInfo.countMiss === 0) || ratio300 > 0.9) {
    return ScoreRank.A;
  }

  if ((ratio300 > 0.7 && scoreInfo.countMiss === 0) || ratio300 > 0.8) {
    return ScoreRank.B;
  }

  return ratio300 > 0.6 ? ScoreRank.C : ScoreRank.D;
}

/**
 * Calculates rank of an osu!taiko score.
 * @param scoreInfo Score information.
 * @returns Calculated osu!taiko score rank.
 */
function calculateTaikoRank(scoreInfo: IScoreInfo): ScoreRank {
  const hasFL = scoreInfo.mods?.has('FL') ?? false;
  const hasHD = scoreInfo.mods?.has('HD') ?? false;

  const ratio300 = Math.fround(scoreInfo.count300 / scoreInfo.totalHits);
  const ratio50 = Math.fround(scoreInfo.count50 / scoreInfo.totalHits);

  if (ratio300 === 1) {
    return hasHD || hasFL ? ScoreRank.XH : ScoreRank.X;
  }

  if (ratio300 > 0.9 && ratio50 <= 0.01 && scoreInfo.countMiss === 0) {
    return hasHD || hasFL ? ScoreRank.SH : ScoreRank.S;
  }

  if ((ratio300 > 0.8 && scoreInfo.countMiss === 0) || ratio300 > 0.9) {
    return ScoreRank.A;
  }

  if ((ratio300 > 0.7 && scoreInfo.countMiss === 0) || ratio300 > 0.8) {
    return ScoreRank.B;
  }

  return ratio300 > 0.6 ? ScoreRank.C : ScoreRank.D;
}

/**
 * Calculates rank of an osu!catch score.
 * @param scoreInfo Score information.
 * @returns Calculated osu!catch score rank.
 */
function calculateCatchRank(scoreInfo: IScoreInfo): ScoreRank {
  const hasFL = scoreInfo.mods?.has('FL') ?? false;
  const hasHD = scoreInfo.mods?.has('HD') ?? false;
  const accuracy = scoreInfo.accuracy;

  if (accuracy === 1) {
    return hasHD || hasFL ? ScoreRank.XH : ScoreRank.X;
  }

  if (accuracy > 0.98) {
    return hasHD || hasFL ? ScoreRank.SH : ScoreRank.S;
  }

  if (accuracy > 0.94) return ScoreRank.A;
  if (accuracy > 0.90) return ScoreRank.B;
  if (accuracy > 0.85) return ScoreRank.C;

  return ScoreRank.D;
}

/**
 * Calculates rank of an osu!mania score.
 * @param scoreInfo Score information.
 * @returns Calculated osu!mania score rank.
 */
function calculateManiaRank(scoreInfo: IScoreInfo): ScoreRank {
  const hasFL = scoreInfo.mods?.has('FL') ?? false;
  const hasHD = scoreInfo.mods?.has('HD') ?? false;
  const accuracy = scoreInfo.accuracy;

  if (accuracy === 1) {
    return hasHD || hasFL ? ScoreRank.XH : ScoreRank.X;
  }

  if (accuracy > 0.95) {
    return hasHD || hasFL ? ScoreRank.SH : ScoreRank.S;
  }

  if (accuracy > 0.9) return ScoreRank.A;
  if (accuracy > 0.8) return ScoreRank.B;
  if (accuracy > 0.7) return ScoreRank.C;

  return ScoreRank.D;
}
