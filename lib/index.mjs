import md5 from 'md5';
import { readFileSync } from 'fs';
import { Downloader, DownloadEntry, DownloadType } from 'osu-downloader';
import { BeatmapDecoder, ScoreDecoder } from 'osu-parsers';
import { BeatmapInfo, HitType, Beatmap, ModType, ScoreRank, ScoreInfo } from 'osu-classes';
import { JuiceDroplet, JuiceTinyDroplet, JuiceFruit, CatchRuleset, CatchDifficultyAttributes } from 'osu-catch-stable';
import { StandardRuleset, StandardDifficultyAttributes } from 'osu-standard-stable';
import { TaikoRuleset, TaikoDifficultyAttributes } from 'osu-taiko-stable';
import { ManiaRuleset, ManiaDifficultyAttributes } from 'osu-mania-stable';

function calculateDifficulty(options) {
  const { beatmap, ruleset, mods } = options;

  if (!beatmap || !ruleset) {
    throw new Error('Cannot calculate difficulty attributes');
  }

  const calculator = ruleset.createDifficultyCalculator(beatmap);

  if (typeof mods !== 'string' && typeof mods !== 'number') {
    return calculator.calculate();
  }

  const combination = ruleset.createModCombination(mods);

  return calculator.calculateWithMods(combination);
}

function calculatePerformance(options) {
  const { difficulty, scoreInfo, ruleset } = options;

  if (!difficulty || !scoreInfo || !ruleset) {
    throw new Error('Cannot calculate performance attributes');
  }

  const castedDifficulty = difficulty;
  const calculator = ruleset.createPerformanceCalculator(castedDifficulty, scoreInfo);

  return calculator.calculateAttributes();
}

let GameMode;

(function(GameMode) {
  GameMode[GameMode['Osu'] = 0] = 'Osu';
  GameMode[GameMode['Taiko'] = 1] = 'Taiko';
  GameMode[GameMode['Fruits'] = 2] = 'Fruits';
  GameMode[GameMode['Mania'] = 3] = 'Mania';
})(GameMode || (GameMode = {}));

function createBeatmapInfo(beatmap, hash) {
  return new BeatmapInfo({
    id: beatmap?.metadata.beatmapId,
    beatmapsetId: beatmap?.metadata.beatmapSetId,
    creator: beatmap?.metadata.creator,
    title: beatmap?.metadata.title,
    artist: beatmap?.metadata.artist,
    version: beatmap?.metadata.version,
    hittable: countObjects(HitType.Normal, beatmap),
    slidable: countObjects(HitType.Slider, beatmap),
    spinnable: countObjects(HitType.Spinner, beatmap),
    holdable: countObjects(HitType.Hold, beatmap),
    length: (beatmap?.length ?? 0) / 1000,
    bpmMin: beatmap?.bpmMin,
    bpmMax: beatmap?.bpmMax,
    bpmMode: beatmap?.bpmMode,
    circleSize: beatmap?.difficulty.circleSize,
    approachRate: beatmap?.difficulty.approachRate,
    overallDifficulty: beatmap?.difficulty.overallDifficulty,
    drainRate: beatmap?.difficulty.drainRate,
    rulesetId: beatmap?.mode,
    mods: getMods(beatmap),
    maxCombo: getMaxCombo(beatmap),
    isConvert: beatmap?.originalMode !== beatmap?.mode,
    md5: hash ?? '',
  });
}

function createBeatmapAttributes(beatmap) {
  return {
    beatmapId: beatmap?.metadata.beatmapId,
    rulesetId: beatmap?.mode,
    mods: getMods(beatmap)?.toString() ?? 'NM',
    totalHits: getTotalHits(beatmap),
    maxCombo: getMaxCombo(beatmap),
    maxFruits: countFruits(beatmap),
    maxDroplets: countDroplets(beatmap),
    maxTinyDroplets: countTinyDroplets(beatmap),
  };
}

function countObjects(hitType, beatmap) {
  if (!beatmap) {
    return 0;
  }

  return beatmap.hitObjects.reduce((sum, obj) => {
    return sum + (obj.hitType & hitType ? 1 : 0);
  }, 0);
}

function countFruits(beatmap) {
  return countNested(JuiceFruit, beatmap);
}

function countDroplets(beatmap) {
  return countNested(JuiceDroplet, beatmap);
}

function countTinyDroplets(beatmap) {
  return countNested(JuiceTinyDroplet, beatmap);
}

function countNested(Class, beatmap) {
  const rulesetBeatmap = beatmap;

  return rulesetBeatmap.hitObjects.reduce((sum, obj) => {
    const nestedSum = obj.nestedHitObjects?.reduce((sum, obj) => {
      return sum + (obj instanceof Class ? 1 : 0);
    }, 0);

    return sum + (nestedSum ?? 0);
  }, 0);
}

function getTotalHits(beatmap) {
  if (!beatmap) {
    return 0;
  }

  switch (beatmap.mode) {
    case GameMode.Osu: {
      const circles = countObjects(HitType.Normal, beatmap);
      const sliders = countObjects(HitType.Slider, beatmap);
      const spinners = countObjects(HitType.Spinner, beatmap);

      return circles + sliders + spinners;
    }
    case GameMode.Taiko: {
      return countObjects(HitType.Normal, beatmap);
    }
    case GameMode.Fruits: {
      const hittable = countObjects(HitType.Normal, beatmap);
      const tinyDroplets = countNested(JuiceTinyDroplet, beatmap);
      const droplets = countNested(JuiceDroplet, beatmap) - tinyDroplets;
      const fruits = countNested(JuiceFruit, beatmap) + hittable;

      return fruits + droplets + tinyDroplets;
    }
    case GameMode.Mania: {
      const notes = countObjects(HitType.Normal, beatmap);
      const holds = countObjects(HitType.Hold, beatmap);

      return notes + holds;
    }
  }

  const hittable = countObjects(HitType.Normal, beatmap);
  const slidable = countObjects(HitType.Slider, beatmap);
  const spinnable = countObjects(HitType.Spinner, beatmap);
  const holdable = countObjects(HitType.Hold, beatmap);

  return hittable + slidable + spinnable + holdable;
}

function getMaxCombo(beatmap) {
  return beatmap?.maxCombo ?? 0;
}

function getMods(beatmap) {
  return beatmap?.mods ?? null;
}

function getRulesetIdByName(rulesetName) {
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

function getRulesetById(rulesetId) {
  switch (rulesetId) {
    case GameMode.Osu: return new StandardRuleset();
    case GameMode.Taiko: return new TaikoRuleset();
    case GameMode.Fruits: return new CatchRuleset();
    case GameMode.Mania: return new ManiaRuleset();
  }

  throw new Error('Unknown ruleset!');
}

function toDifficultyAttributes(difficulty, rulesetId) {
  const attributes = createAttributes(rulesetId, difficulty?.mods);

  if (typeof difficulty !== 'object') {
    return attributes;
  }

  for (const key in difficulty) {
    if (key in attributes) {
      attributes[key] = difficulty[key];
    }
  }

  return attributes;
}

function createAttributes(rulesetId, mods) {
  const ruleset = getRulesetById(rulesetId ?? GameMode.Osu);
  const combination = ruleset.createModCombination(mods);

  switch (ruleset.id) {
    case GameMode.Taiko: return new TaikoDifficultyAttributes(combination, 0);
    case GameMode.Fruits: return new CatchDifficultyAttributes(combination, 0);
    case GameMode.Mania: return new ManiaDifficultyAttributes(combination, 0);
  }

  return new StandardDifficultyAttributes(combination, 0);
}

async function downloadFile(path, options) {
  const downloader = new Downloader({ rootPath: path });
  const entry = new DownloadEntry(options);

  await downloader.addSingleEntry(entry);

  return downloader.downloadSingle();
}

function generateHitStatistics(attributes, accuracy = 1, countMiss = 0, count50, count100) {
  if (accuracy > 1) {
    accuracy /= 100;
  }

  switch (attributes.rulesetId) {
    case GameMode.Taiko:
      return generateTaikoHitStatistics(attributes, accuracy, countMiss, count100);
    case GameMode.Fruits:
      return generateCatchHitStatistics(attributes, accuracy, countMiss, count50, count100);
    case GameMode.Mania:
      return generateManiaHitStatistics(attributes);
  }

  return generateOsuHitStatistics(attributes, accuracy, countMiss, count50, count100);
}

function generateOsuHitStatistics(attributes, accuracy = 1, countMiss = 0, count50, count100) {
  const totalHits = attributes.totalHits ?? 0;

  countMiss = Math.min(Math.max(0, countMiss), totalHits);
  count50 = count50 ? Math.min(Math.max(0, count50), totalHits - countMiss) : 0;

  if (typeof count100 !== 'number') {
    count100 = Math.round((totalHits - totalHits * accuracy) * 1.5);
  }
  else {
    count100 = Math.min(Math.max(0, count100), totalHits - count50 - countMiss);
  }

  const count300 = totalHits - count100 - count50 - countMiss;

  return {
    great: count300,
    ok: count100,
    meh: count50 ?? 0,
    miss: countMiss,
  };
}

function generateTaikoHitStatistics(attributes, accuracy = 1, countMiss = 0, count100) {
  const totalHits = attributes.totalHits ?? 0;

  countMiss = Math.max(0, Math.min(countMiss, totalHits));

  let count300;

  if (typeof count100 !== 'number') {
    const targetTotal = Math.round(accuracy * totalHits * 2);

    count300 = targetTotal - (totalHits - countMiss);
    count100 = totalHits - count300 - countMiss;
  }
  else {
    count100 = Math.min(Math.max(0, count100), totalHits - countMiss);
    count300 = totalHits - count100 - countMiss;
  }

  return {
    great: count300,
    ok: count100,
    miss: countMiss,
  };
}

function generateCatchHitStatistics(attributes, accuracy = 1, countMiss = 0, count50, count100) {
  const maxCombo = attributes.maxCombo ?? 0;
  const maxFruits = attributes.maxFruits ?? 0;
  const maxDroplets = attributes.maxDroplets ?? 0;
  const maxTinyDroplets = attributes.maxTinyDroplets ?? 0;

  if (typeof count100 === 'number') {
    countMiss += maxDroplets - count100;
  }

  countMiss = Math.max(0, Math.min(countMiss, maxDroplets + maxFruits));

  let droplets = count100 ?? Math.max(0, maxDroplets - countMiss);

  droplets = Math.max(0, Math.min(droplets, maxDroplets));

  const fruits = maxFruits - (countMiss - (maxDroplets - droplets));
  let tinyDroplets = Math.round(accuracy * (maxCombo + maxTinyDroplets));

  tinyDroplets = count50 ?? tinyDroplets - fruits - droplets;

  const tinyMisses = maxTinyDroplets - tinyDroplets;

  return {
    great: Math.max(0, Math.min(fruits, maxFruits)),
    largeTickHit: Math.max(0, Math.min(droplets, maxDroplets)),
    smallTickHit: tinyDroplets,
    smallTickMiss: tinyMisses,
    miss: countMiss,
  };
}

function generateManiaHitStatistics(attributes) {
  return {
    perfect: attributes.totalHits ?? 0,
  };
}

function getValidHitStatistics(original) {
  return {
    perfect: original?.perfect ?? 0,
    great: original?.great ?? 0,
    good: original?.good ?? 0,
    ok: original?.ok ?? 0,
    meh: original?.meh ?? 0,
    largeTickHit: original?.largeTickHit ?? 0,
    smallTickMiss: original?.smallTickMiss ?? 0,
    smallTickHit: original?.smallTickHit ?? 0,
    miss: original?.miss ?? 0,
    largeBonus: 0,
    largeTickMiss: 0,
    smallBonus: 0,
    ignoreHit: 0,
    ignoreMiss: 0,
    none: 0,
  };
}

function toDifficultyMods(mods, rulesetId) {
  const ruleset = getRulesetById(rulesetId ?? GameMode.Osu);
  const difficultyCalculator = ruleset.createDifficultyCalculator(new Beatmap());
  const difficultyMods = difficultyCalculator.difficultyMods;
  const combination = ruleset.createModCombination(mods);
  const difficultyBitwise = combination.all.reduce((bitwise, mod) => {
    const found = difficultyMods.find((m) => {
      if (m.bitwise === mod.bitwise) {
        return true;
      }

      return m.acronym === 'DT' && mod.acronym === 'NC';
    });

    return bitwise + (found?.bitwise ?? 0);
  }, 0);

  return ruleset.createModCombination(difficultyBitwise);
}

function toCombination(mods, rulesetId) {
  const ruleset = getRulesetById(rulesetId ?? GameMode.Osu);

  return ruleset.createModCombination(mods);
}

function calculateAccuracy(scoreInfo) {
  const geki = scoreInfo.countGeki;
  const katu = scoreInfo.countKatu;
  const c300 = scoreInfo.count300;
  const c100 = scoreInfo.count100;
  const c50 = scoreInfo.count50;
  const total = scoreInfo.totalHits;

  if (total <= 0) {
    return 1;
  }

  switch (scoreInfo.rulesetId) {
    case 0:
      return Math.max(0, (c50 / 6 + c100 / 3 + c300) / total);
    case 1:
      return Math.max(0, (c100 / 2 + c300) / total);
    case 2:
      return Math.max(0, (c50 + c100 + c300) / total);
    case 3:
      return Math.max(0, (c50 / 6 + c100 / 3 + katu / 1.5 + (c300 + geki)) / total);
  }

  return 1;
}

function scaleTotalScore(totalScore, mods) {
  const difficultyReduction = mods?.all
    .filter((m) => m.type === ModType.DifficultyReduction) ?? [];

  return difficultyReduction
    .reduce((score, mod) => score * mod.multiplier, totalScore);
}

function calculateRank(scoreInfo) {
  if (!scoreInfo.passed) {
    return ScoreRank.F;
  }

  switch (scoreInfo.rulesetId) {
    case GameMode.Osu: return calculateOsuRank(scoreInfo);
    case GameMode.Taiko: return calculateTaikoRank(scoreInfo);
    case GameMode.Fruits: return calculateCatchRank(scoreInfo);
    case GameMode.Mania: return calculateManiaRank(scoreInfo);
  }

  return ScoreRank.F;
}

function calculateOsuRank(scoreInfo) {
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

function calculateTaikoRank(scoreInfo) {
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

function calculateCatchRank(scoreInfo) {
  const hasFL = scoreInfo.mods?.has('FL') ?? false;
  const hasHD = scoreInfo.mods?.has('HD') ?? false;
  const accuracy = scoreInfo.accuracy;

  if (accuracy === 1) {
    return hasHD || hasFL ? ScoreRank.XH : ScoreRank.X;
  }

  if (accuracy > 0.98) {
    return hasHD || hasFL ? ScoreRank.SH : ScoreRank.S;
  }

  if (accuracy > 0.94) {
    return ScoreRank.A;
  }

  if (accuracy > 0.90) {
    return ScoreRank.B;
  }

  if (accuracy > 0.85) {
    return ScoreRank.C;
  }

  return ScoreRank.D;
}

function calculateManiaRank(scoreInfo) {
  const hasFL = scoreInfo.mods?.has('FL') ?? false;
  const hasHD = scoreInfo.mods?.has('HD') ?? false;
  const accuracy = scoreInfo.accuracy;

  if (accuracy === 1) {
    return hasHD || hasFL ? ScoreRank.XH : ScoreRank.X;
  }

  if (accuracy > 0.95) {
    return hasHD || hasFL ? ScoreRank.SH : ScoreRank.S;
  }

  if (accuracy > 0.9) {
    return ScoreRank.A;
  }

  if (accuracy > 0.8) {
    return ScoreRank.B;
  }

  if (accuracy > 0.7) {
    return ScoreRank.C;
  }

  return ScoreRank.D;
}

async function parseBeatmap(options) {
  const { beatmapId, fileURL, hash, savePath } = options;

  if (typeof beatmapId === 'string' || typeof beatmapId === 'number') {
    return parseBeatmapById(beatmapId, hash, savePath);
  }

  if (typeof fileURL === 'string') {
    return parseCustomBeatmap(fileURL, hash, savePath);
  }

  throw new Error('No beatmap ID or beatmap URL was specified!');
}

async function parseBeatmapById(id, hash, savePath) {
  let _a;
  const result = await downloadFile(savePath, {
    save: typeof savePath === 'string',
    id,
  });

  if (!result.isSuccessful || (!savePath && !result.buffer)) {
    throw new Error(`${result.fileName} failed to download!`);
  }

  const data = savePath
    ? readFileSync(result.filePath)
    : result.buffer;
  const parsed = parseBeatmapData(data, hash);

  (_a = parsed.data.metadata).beatmapId || (_a.beatmapId = parseInt(id));

  return parsed;
}

async function parseCustomBeatmap(url, hash, savePath) {
  const result = await downloadFile(savePath, {
    save: typeof savePath === 'string',
    url,
  });

  if (!result.isSuccessful || (!savePath && !result.buffer)) {
    throw new Error('Custom beatmap failed to download!');
  }

  const data = savePath
    ? readFileSync(result.filePath)
    : result.buffer;

  return parseBeatmapData(data, hash);
}

function parseBeatmapData(data, hash) {
  const stringified = data.toString();
  const targetHash = md5(stringified);

  if (hash && hash !== targetHash) {
    throw new Error('Wrong beatmap file!');
  }

  const decoder = new BeatmapDecoder();
  const parseSb = false;

  return {
    data: decoder.decodeFromString(stringified, parseSb),
    hash: targetHash,
  };
}

async function parseScore(options) {
  const { fileURL, hash } = options;

  if (typeof fileURL === 'string') {
    return parseCustomScore(fileURL, hash);
  }

  throw new Error('No replay URL was specified!');
}

async function parseCustomScore(url, hash) {
  const result = await downloadFile('', {
    type: DownloadType.Replay,
    save: false,
    url,
  });

  if (!result.isSuccessful || !result.buffer) {
    throw new Error('Replay failed to download!');
  }

  return parseScoreData(result.buffer, hash);
}

async function parseScoreData(data, hash) {
  const targetHash = md5(data);

  if (hash && hash !== targetHash) {
    throw new Error('Wrong beatmap file!');
  }

  const decoder = new ScoreDecoder();
  const parseReplay = false;

  return {
    data: await decoder.decodeFromBuffer(data, parseReplay),
    hash: targetHash,
  };
}

class ScoreSimulator {
  simulate(options) {
    const statistics = generateHitStatistics(options.attributes, options.accuracy, options.countMiss, options.count50, options.count100);
    const attributes = options.attributes;
    const beatmapCombo = attributes.maxCombo ?? 0;
    const percentage = options.percentCombo ?? 100;
    const multiplier = Math.max(0, Math.min(percentage, 100)) / 100;
    const scoreCombo = options.maxCombo ?? beatmapCombo * multiplier;
    const misses = statistics.miss ?? 0;
    const limitedCombo = Math.min(scoreCombo, beatmapCombo - misses);
    const maxCombo = Math.max(0, limitedCombo);
    const scoreInfo = this._generateScoreInfo({
      beatmapId: attributes.beatmapId,
      rulesetId: attributes.rulesetId,
      totalHits: attributes.totalHits,
      mods: toCombination(attributes.mods, attributes.rulesetId),
      totalScore: options.totalScore,
      perfect: maxCombo >= beatmapCombo,
      statistics,
      maxCombo,
    });

    return scoreInfo;
  }
  simulateFC(scoreInfo, attributes) {
    if (scoreInfo.rulesetId === GameMode.Mania) {
      return this.simulateMax(attributes);
    }

    const statistics = getValidHitStatistics(scoreInfo.statistics);
    const totalHits = attributes.totalHits ?? 0;

    switch (scoreInfo.rulesetId) {
      case GameMode.Fruits:
        statistics.great = totalHits - statistics.largeTickHit
                    - statistics.smallTickHit - statistics.smallTickMiss - statistics.miss;

        statistics.largeTickHit += statistics.miss;
        break;
      case GameMode.Mania:
        statistics.perfect = totalHits - statistics.great
                    - statistics.good - statistics.ok - statistics.meh;

        break;
      default:
        statistics.great = totalHits - statistics.ok - statistics.meh;
    }

    statistics.miss = 0;

    return this._generateScoreInfo({
      mods: scoreInfo.mods
                ?? toCombination(attributes.mods, attributes.rulesetId),
      beatmapId: attributes.beatmapId,
      rulesetId: attributes.rulesetId,
      maxCombo: attributes.maxCombo,
      perfect: true,
      statistics,
      totalHits,
    });
  }
  simulateMax(attributes) {
    const statistics = generateHitStatistics(attributes);
    const totalHits = attributes.totalHits ?? 0;
    const score = this._generateScoreInfo({
      beatmapId: attributes.beatmapId,
      rulesetId: attributes.rulesetId,
      maxCombo: attributes.maxCombo,
      mods: toCombination(attributes.mods, attributes.rulesetId),
      perfect: true,
      statistics,
      totalHits,
    });

    if (attributes.rulesetId === GameMode.Mania) {
      score.totalScore = 1e6;
    }

    return score;
  }
  _generateScoreInfo(options) {
    const scoreInfo = new ScoreInfo();

    scoreInfo.beatmapId = options?.beatmapId ?? 0;
    scoreInfo.userId = options?.userId ?? 0;
    scoreInfo.username = options?.username ?? 'osu!';
    scoreInfo.maxCombo = options?.maxCombo ?? 0;
    scoreInfo.statistics = getValidHitStatistics(options?.statistics);
    scoreInfo.mods = options?.mods?.clone() ?? null;
    scoreInfo.rulesetId = options?.rulesetId ?? GameMode.Osu;
    scoreInfo.passed = scoreInfo.totalHits >= (options?.totalHits ?? 0);
    scoreInfo.perfect = options?.perfect ?? false;
    scoreInfo.totalScore = options?.totalScore
            ?? scaleTotalScore(1e6, scoreInfo.mods);

    scoreInfo.accuracy = options.accuracy
            ?? calculateAccuracy(scoreInfo);

    scoreInfo.rank = ScoreRank[calculateRank(scoreInfo)];

    return scoreInfo;
  }
}

class BeatmapCalculator {
  constructor() {
    this._scoreSimulator = new ScoreSimulator();
  }
  async calculate(options) {
    if (this._checkPrecalculated(options)) {
      return this._processPrecalculated(options);
    }

    const { data: parsed, hash: beatmapMD5 } = await parseBeatmap(options);
    const ruleset = options.ruleset ?? getRulesetById(options.rulesetId ?? parsed.mode);
    const combination = ruleset.createModCombination(options.mods);
    const beatmap = ruleset.applyToBeatmapWithMods(parsed, combination);
    const beatmapInfo = options.beatmapInfo ?? createBeatmapInfo(beatmap, beatmapMD5);
    const attributes = options.attributes ?? createBeatmapAttributes(beatmap);
    const difficulty = options.difficulty
      ? toDifficultyAttributes(options.difficulty, ruleset.id)
      : calculateDifficulty({ beatmap, ruleset });
    const scores = this._simulateScores(attributes, options);
    const performance = scores.map((scoreInfo) => calculatePerformance({
      difficulty,
      ruleset,
      scoreInfo,
    }));

    return {
      beatmapInfo: beatmapInfo.toJSON(),
      attributes,
      difficulty,
      performance,
    };
  }
  _processPrecalculated(options) {
    const { beatmapInfo, attributes } = options;
    const ruleset = options.ruleset ?? getRulesetById(attributes.rulesetId);
    const difficulty = toDifficultyAttributes(options.difficulty, ruleset.id);
    const scores = this._simulateScores(attributes, options);
    const performance = scores.map((scoreInfo) => calculatePerformance({
      difficulty,
      ruleset,
      scoreInfo,
    }));

    return {
      beatmapInfo: beatmapInfo.toJSON(),
      attributes,
      difficulty,
      performance,
    };
  }
  _checkPrecalculated(options) {
    return !!options.beatmapInfo && !!options.attributes && !!options.difficulty;
  }
  _simulateScores(attributes, options) {
    return attributes.rulesetId === GameMode.Mania
      ? this._simulateManiaScores(attributes, options.totalScores)
      : this._simulateOtherScores(attributes, options.accuracy);
  }
  _simulateOtherScores(attributes, accuracy) {
    accuracy ?? (accuracy = [95, 97, 99, 100]);

    return accuracy.map((accuracy) => this._scoreSimulator.simulate({
      attributes,
      accuracy,
    }));
  }
  _simulateManiaScores(attributes, totalScores) {
    const mods = toCombination(attributes.mods, attributes.rulesetId);

    totalScores ?? (totalScores = [
      scaleTotalScore(7e5, mods),
      scaleTotalScore(8e5, mods),
      scaleTotalScore(9e5, mods),
      scaleTotalScore(1e6, mods),
    ]);

    return totalScores.map((totalScore) => this._scoreSimulator.simulate({
      attributes,
      totalScore,
    }));
  }
}

class ScoreCalculator {
  constructor() {
    this._scoreSimulator = new ScoreSimulator();
  }
  async calculate(options) {
    if (this._checkPrecalculated(options)) {
      return this._processPrecalculated(options);
    }

    const { data: parsed, hash } = await parseBeatmap(options);
    const ruleset = options.ruleset
            ?? getRulesetById(options.rulesetId ?? parsed.mode);
    const combination = ruleset.createModCombination(options.mods);
    const beatmap = ruleset.applyToBeatmapWithMods(parsed, combination);
    const attributes = options.attributes ?? createBeatmapAttributes(beatmap);
    const difficulty = options.difficulty
      ? toDifficultyAttributes(options.difficulty, ruleset.id)
      : calculateDifficulty({ beatmap, ruleset });
    const scoreInfo = options.scoreInfo
            ?? this._scoreSimulator.simulate({ ...options, attributes });

    scoreInfo.beatmapHashMD5 = hash;

    const performance = calculatePerformance({
      ruleset: getRulesetById(difficulty.mods.mode),
      difficulty,
      scoreInfo,
    });

    return {
      scoreInfo: scoreInfo.toJSON(),
      difficulty,
      performance,
    };
  }
  _processPrecalculated(options) {
    const ruleset = options.ruleset ?? getRulesetById(options.attributes.rulesetId);
    const difficulty = toDifficultyAttributes(options.difficulty, ruleset.id);
    const scoreInfo = options.scoreInfo ?? this._scoreSimulator.simulate(options);
    const performance = calculatePerformance({
      difficulty,
      ruleset,
      scoreInfo,
    });

    return {
      scoreInfo: scoreInfo.toJSON(),
      difficulty,
      performance,
    };
  }
  _checkPrecalculated(options) {
    return !!options.attributes && !!options.difficulty;
  }
}

export { BeatmapCalculator, GameMode, ScoreCalculator, ScoreSimulator, calculateAccuracy, calculateDifficulty, calculatePerformance, calculateRank, createBeatmapAttributes, createBeatmapInfo, downloadFile, generateHitStatistics, getRulesetById, getRulesetIdByName, getValidHitStatistics, parseBeatmap, parseScore, scaleTotalScore, toCombination, toDifficultyAttributes, toDifficultyMods };
