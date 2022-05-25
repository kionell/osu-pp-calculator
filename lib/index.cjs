'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

let osuClasses = require('osu-classes');
let osuStandardStable = require('osu-standard-stable');
let osuTaikoStable = require('osu-taiko-stable');
let osuCatchStable = require('osu-catch-stable');
let osuManiaStable = require('osu-mania-stable');
let md5 = require('md5');
let fs = require('fs');
let osuDownloader = require('osu-downloader');
let osuParsers = require('osu-parsers');

function _interopDefaultLegacy(e) {
  return e && typeof e === 'object' && 'default' in e ? e : { 'default': e };
}

let md5__default = /* #__PURE__*/_interopDefaultLegacy(md5);

function calculateDifficulty(options) {
  const { beatmap, ruleset, mods } = options;

  if (!beatmap || !ruleset) {
    throw new Error('Cannot calculate difficulty attributes');
  }

  const calculator = options.calculator
        ?? ruleset.createDifficultyCalculator(beatmap);

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

exports.GameMode = void 0;

(function(GameMode) {
  GameMode[GameMode['Osu'] = 0] = 'Osu';
  GameMode[GameMode['Taiko'] = 1] = 'Taiko';
  GameMode[GameMode['Fruits'] = 2] = 'Fruits';
  GameMode[GameMode['Mania'] = 3] = 'Mania';
})(exports.GameMode || (exports.GameMode = {}));

class ExtendedStandardDifficultyCalculator extends osuStandardStable.StandardDifficultyCalculator {
  constructor() {
    super(...arguments);
    this._skills = [];
  }
  getSkills() {
    return this._skills;
  }
  _createDifficultyAttributes(beatmap, mods, skills) {
    this._skills = skills;

    return super._createDifficultyAttributes(beatmap, mods, skills);
  }
}

class ExtendedTaikoDifficultyCalculator extends osuTaikoStable.TaikoDifficultyCalculator {
  constructor() {
    super(...arguments);
    this._skills = [];
  }
  getSkills() {
    return this._skills;
  }
  _createDifficultyAttributes(beatmap, mods, skills) {
    this._skills = skills;

    return super._createDifficultyAttributes(beatmap, mods, skills);
  }
}

class ExtendedCatchDifficultyCalculator extends osuCatchStable.CatchDifficultyCalculator {
  constructor() {
    super(...arguments);
    this._skills = [];
  }
  getSkills() {
    return this._skills;
  }
  _createDifficultyAttributes(beatmap, mods, skills) {
    this._skills = skills;

    return super._createDifficultyAttributes(beatmap, mods, skills);
  }
}

class ExtendedManiaDifficultyCalculator extends osuManiaStable.ManiaDifficultyCalculator {
  constructor() {
    super(...arguments);
    this._skills = [];
  }
  getSkills() {
    return this._skills;
  }
  _createDifficultyAttributes(beatmap, mods, skills) {
    this._skills = skills;

    return super._createDifficultyAttributes(beatmap, mods, skills);
  }
}

function createDifficultyCalculator(beatmap, ruleset) {
  switch (ruleset.id) {
    case exports.GameMode.Osu:
      return new ExtendedStandardDifficultyCalculator(beatmap, ruleset);
    case exports.GameMode.Taiko:
      return new ExtendedTaikoDifficultyCalculator(beatmap, ruleset);
    case exports.GameMode.Fruits:
      return new ExtendedCatchDifficultyCalculator(beatmap, ruleset);
    case exports.GameMode.Mania:
      return new ExtendedManiaDifficultyCalculator(beatmap, ruleset);
  }

  throw new Error('This ruleset does not support strain output!');
}

function createBeatmapInfo(beatmap, hash) {
  return new osuClasses.BeatmapInfo({
    id: beatmap?.metadata.beatmapId,
    beatmapsetId: beatmap?.metadata.beatmapSetId,
    creator: beatmap?.metadata.creator,
    title: beatmap?.metadata.title,
    artist: beatmap?.metadata.artist,
    version: beatmap?.metadata.version,
    hittable: countObjects(osuClasses.HitType.Normal, beatmap),
    slidable: countObjects(osuClasses.HitType.Slider, beatmap),
    spinnable: countObjects(osuClasses.HitType.Spinner, beatmap),
    holdable: countObjects(osuClasses.HitType.Hold, beatmap),
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
  const hittable = countObjects(osuClasses.HitType.Normal, beatmap);
  const maxTinyDroplets = countTinyDroplets(beatmap);
  const maxDroplets = countDroplets(beatmap) - maxTinyDroplets;
  const maxFruits = countFruits(beatmap) + hittable;
  const totalHits = beatmap?.mode === exports.GameMode.Fruits
    ? maxFruits + maxDroplets + maxTinyDroplets
    : getTotalHits(beatmap);

  return {
    beatmapId: beatmap?.metadata.beatmapId,
    rulesetId: beatmap?.mode,
    mods: getMods(beatmap)?.toString() ?? 'NM',
    maxCombo: getMaxCombo(beatmap),
    totalHits,
    maxFruits,
    maxDroplets,
    maxTinyDroplets,
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
  return countNested(osuCatchStable.JuiceFruit, beatmap);
}

function countDroplets(beatmap) {
  return countNested(osuCatchStable.JuiceDroplet, beatmap);
}

function countTinyDroplets(beatmap) {
  return countNested(osuCatchStable.JuiceTinyDroplet, beatmap);
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
    case exports.GameMode.Osu: {
      const circles = countObjects(osuClasses.HitType.Normal, beatmap);
      const sliders = countObjects(osuClasses.HitType.Slider, beatmap);
      const spinners = countObjects(osuClasses.HitType.Spinner, beatmap);

      return circles + sliders + spinners;
    }
    case exports.GameMode.Taiko: {
      return countObjects(osuClasses.HitType.Normal, beatmap);
    }
    case exports.GameMode.Fruits: {
      const hittable = countObjects(osuClasses.HitType.Normal, beatmap);
      const tinyDroplets = countTinyDroplets(beatmap);
      const droplets = countDroplets(beatmap) - tinyDroplets;
      const fruits = countFruits(beatmap) + hittable;

      return fruits + droplets + tinyDroplets;
    }
    case exports.GameMode.Mania: {
      const notes = countObjects(osuClasses.HitType.Normal, beatmap);
      const holds = countObjects(osuClasses.HitType.Hold, beatmap);

      return notes + holds;
    }
  }

  const hittable = countObjects(osuClasses.HitType.Normal, beatmap);
  const slidable = countObjects(osuClasses.HitType.Slider, beatmap);
  const spinnable = countObjects(osuClasses.HitType.Spinner, beatmap);
  const holdable = countObjects(osuClasses.HitType.Hold, beatmap);

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
    case 'osu': return exports.GameMode.Osu;
    case 'taiko': return exports.GameMode.Taiko;
    case 'ctb':
    case 'catch':
    case 'fruits': return exports.GameMode.Fruits;
    case 'mania': return exports.GameMode.Mania;
  }

  throw new Error('Unknown ruleset!');
}

function getRulesetById(rulesetId) {
  switch (rulesetId) {
    case exports.GameMode.Osu: return new osuStandardStable.StandardRuleset();
    case exports.GameMode.Taiko: return new osuTaikoStable.TaikoRuleset();
    case exports.GameMode.Fruits: return new osuCatchStable.CatchRuleset();
    case exports.GameMode.Mania: return new osuManiaStable.ManiaRuleset();
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
  const ruleset = getRulesetById(rulesetId ?? exports.GameMode.Osu);
  const combination = ruleset.createModCombination(mods);

  switch (ruleset.id) {
    case exports.GameMode.Taiko: return new osuTaikoStable.TaikoDifficultyAttributes(combination, 0);
    case exports.GameMode.Fruits: return new osuCatchStable.CatchDifficultyAttributes(combination, 0);
    case exports.GameMode.Mania: return new osuManiaStable.ManiaDifficultyAttributes(combination, 0);
  }

  return new osuStandardStable.StandardDifficultyAttributes(combination, 0);
}

async function downloadFile(path, options) {
  const downloader = new osuDownloader.Downloader({ rootPath: path });
  const entry = new osuDownloader.DownloadEntry(options);

  downloader.addSingleEntry(entry);

  return downloader.downloadSingle();
}

function generateHitStatistics(attributes, accuracy = 1, countMiss = 0, count50, count100) {
  if (accuracy > 1) {
    accuracy /= 100;
  }

  switch (attributes.rulesetId) {
    case exports.GameMode.Taiko:
      return generateTaikoHitStatistics(attributes, accuracy, countMiss, count100);
    case exports.GameMode.Fruits:
      return generateCatchHitStatistics(attributes, accuracy, countMiss, count50, count100);
    case exports.GameMode.Mania:
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
  const ruleset = getRulesetById(rulesetId ?? exports.GameMode.Osu);
  const difficultyCalculator = ruleset.createDifficultyCalculator(new osuClasses.Beatmap());
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
  const ruleset = getRulesetById(rulesetId ?? exports.GameMode.Osu);

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
    .filter((m) => m.type === osuClasses.ModType.DifficultyReduction) ?? [];

  return difficultyReduction
    .reduce((score, mod) => score * mod.multiplier, totalScore);
}

function calculateRank(scoreInfo) {
  if (!scoreInfo.passed) {
    return osuClasses.ScoreRank.F;
  }

  switch (scoreInfo.rulesetId) {
    case exports.GameMode.Osu: return calculateOsuRank(scoreInfo);
    case exports.GameMode.Taiko: return calculateTaikoRank(scoreInfo);
    case exports.GameMode.Fruits: return calculateCatchRank(scoreInfo);
    case exports.GameMode.Mania: return calculateManiaRank(scoreInfo);
  }

  return osuClasses.ScoreRank.F;
}

function calculateOsuRank(scoreInfo) {
  const hasFL = scoreInfo.mods?.has('FL') ?? false;
  const hasHD = scoreInfo.mods?.has('HD') ?? false;
  const ratio300 = Math.fround(scoreInfo.count300 / scoreInfo.totalHits);
  const ratio50 = Math.fround(scoreInfo.count50 / scoreInfo.totalHits);

  if (ratio300 === 1) {
    return hasHD || hasFL ? osuClasses.ScoreRank.XH : osuClasses.ScoreRank.X;
  }

  if (ratio300 > 0.9 && ratio50 <= 0.01 && scoreInfo.countMiss === 0) {
    return hasHD || hasFL ? osuClasses.ScoreRank.SH : osuClasses.ScoreRank.S;
  }

  if ((ratio300 > 0.8 && scoreInfo.countMiss === 0) || ratio300 > 0.9) {
    return osuClasses.ScoreRank.A;
  }

  if ((ratio300 > 0.7 && scoreInfo.countMiss === 0) || ratio300 > 0.8) {
    return osuClasses.ScoreRank.B;
  }

  return ratio300 > 0.6 ? osuClasses.ScoreRank.C : osuClasses.ScoreRank.D;
}

function calculateTaikoRank(scoreInfo) {
  const hasFL = scoreInfo.mods?.has('FL') ?? false;
  const hasHD = scoreInfo.mods?.has('HD') ?? false;
  const ratio300 = Math.fround(scoreInfo.count300 / scoreInfo.totalHits);
  const ratio50 = Math.fround(scoreInfo.count50 / scoreInfo.totalHits);

  if (ratio300 === 1) {
    return hasHD || hasFL ? osuClasses.ScoreRank.XH : osuClasses.ScoreRank.X;
  }

  if (ratio300 > 0.9 && ratio50 <= 0.01 && scoreInfo.countMiss === 0) {
    return hasHD || hasFL ? osuClasses.ScoreRank.SH : osuClasses.ScoreRank.S;
  }

  if ((ratio300 > 0.8 && scoreInfo.countMiss === 0) || ratio300 > 0.9) {
    return osuClasses.ScoreRank.A;
  }

  if ((ratio300 > 0.7 && scoreInfo.countMiss === 0) || ratio300 > 0.8) {
    return osuClasses.ScoreRank.B;
  }

  return ratio300 > 0.6 ? osuClasses.ScoreRank.C : osuClasses.ScoreRank.D;
}

function calculateCatchRank(scoreInfo) {
  const hasFL = scoreInfo.mods?.has('FL') ?? false;
  const hasHD = scoreInfo.mods?.has('HD') ?? false;
  const accuracy = scoreInfo.accuracy;

  if (accuracy === 1) {
    return hasHD || hasFL ? osuClasses.ScoreRank.XH : osuClasses.ScoreRank.X;
  }

  if (accuracy > 0.98) {
    return hasHD || hasFL ? osuClasses.ScoreRank.SH : osuClasses.ScoreRank.S;
  }

  if (accuracy > 0.94) {
    return osuClasses.ScoreRank.A;
  }

  if (accuracy > 0.90) {
    return osuClasses.ScoreRank.B;
  }

  if (accuracy > 0.85) {
    return osuClasses.ScoreRank.C;
  }

  return osuClasses.ScoreRank.D;
}

function calculateManiaRank(scoreInfo) {
  const hasFL = scoreInfo.mods?.has('FL') ?? false;
  const hasHD = scoreInfo.mods?.has('HD') ?? false;
  const accuracy = scoreInfo.accuracy;

  if (accuracy === 1) {
    return hasHD || hasFL ? osuClasses.ScoreRank.XH : osuClasses.ScoreRank.X;
  }

  if (accuracy > 0.95) {
    return hasHD || hasFL ? osuClasses.ScoreRank.SH : osuClasses.ScoreRank.S;
  }

  if (accuracy > 0.9) {
    return osuClasses.ScoreRank.A;
  }

  if (accuracy > 0.8) {
    return osuClasses.ScoreRank.B;
  }

  if (accuracy > 0.7) {
    return osuClasses.ScoreRank.C;
  }

  return osuClasses.ScoreRank.D;
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
    throw new Error(`Beatmap with ID "${id}" failed to download: "${result.statusText}"`);
  }

  const data = savePath
    ? fs.readFileSync(result.filePath)
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
    throw new Error(`Beatmap from "${url}" failed to download: ${result.statusText}`);
  }

  const data = savePath
    ? fs.readFileSync(result.filePath)
    : result.buffer;

  return parseBeatmapData(data, hash);
}

function parseBeatmapData(data, hash) {
  const stringified = data.toString();
  const targetHash = md5__default['default'](stringified);

  if (hash && hash !== targetHash) {
    throw new Error('Wrong beatmap file!');
  }

  const decoder = new osuParsers.BeatmapDecoder();
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
    type: osuDownloader.DownloadType.Replay,
    save: false,
    url,
  });

  if (!result.isSuccessful || !result.buffer) {
    throw new Error('Replay failed to download!');
  }

  return parseScoreData(result.buffer, hash);
}

async function parseScoreData(data, hash) {
  const targetHash = md5__default['default'](data);

  if (hash && hash !== targetHash) {
    throw new Error('Wrong beatmap file!');
  }

  const decoder = new osuParsers.ScoreDecoder();
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
    if (scoreInfo.rulesetId === exports.GameMode.Mania) {
      return this.simulateMax(attributes);
    }

    const statistics = getValidHitStatistics(scoreInfo.statistics);
    const totalHits = attributes.totalHits ?? 0;

    switch (scoreInfo.rulesetId) {
      case exports.GameMode.Fruits:
        statistics.great = totalHits - statistics.largeTickHit
                    - statistics.smallTickHit - statistics.smallTickMiss - statistics.miss;

        statistics.largeTickHit += statistics.miss;
        break;
      case exports.GameMode.Mania:
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

    if (attributes.rulesetId === exports.GameMode.Mania) {
      score.totalScore = 1e6;
    }

    return score;
  }
  _generateScoreInfo(options) {
    const scoreInfo = new osuClasses.ScoreInfo();

    scoreInfo.beatmapId = options?.beatmapId ?? 0;
    scoreInfo.userId = options?.userId ?? 0;
    scoreInfo.username = options?.username ?? 'osu!';
    scoreInfo.maxCombo = options?.maxCombo ?? 0;
    scoreInfo.statistics = getValidHitStatistics(options?.statistics);
    scoreInfo.mods = options?.mods?.clone() ?? null;
    scoreInfo.rulesetId = options?.rulesetId ?? exports.GameMode.Osu;
    scoreInfo.passed = scoreInfo.totalHits >= (options?.totalHits ?? 0);
    scoreInfo.perfect = options?.perfect ?? false;
    scoreInfo.totalScore = options?.totalScore
            ?? scaleTotalScore(1e6, scoreInfo.mods);

    scoreInfo.accuracy = options.accuracy
            ?? calculateAccuracy(scoreInfo);

    scoreInfo.rank = osuClasses.ScoreRank[calculateRank(scoreInfo)];

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
    const calculator = createDifficultyCalculator(beatmap, ruleset);
    const difficulty = options.difficulty && !options.strains
      ? toDifficultyAttributes(options.difficulty, ruleset.id)
      : calculateDifficulty({ beatmap, ruleset, calculator });
    const skills = options.strains ? this._getSkillsOutput(calculator) : null;
    const scores = this._simulateScores(attributes, options);
    const performance = scores.map((scoreInfo) => calculatePerformance({
      difficulty,
      ruleset,
      scoreInfo,
    }));

    return {
      beatmapInfo: beatmapInfo.toJSON(),
      attributes,
      skills,
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
      skills: null,
      attributes,
      difficulty,
      performance,
    };
  }
  _checkPrecalculated(options) {
    return !!options.beatmapInfo
            && !!options.attributes
            && !!options.difficulty
            && !options.strains;
  }
  _getSkillsOutput(calculator) {
    const skills = calculator.getSkills();
    const strainSkills = skills.filter((s) => s instanceof osuClasses.StrainSkill);
    const output = strainSkills.map((skill) => {
      return {
        title: skill.constructor.name,
        strainPeaks: [...skill.getCurrentStrainPeaks()],
      };
    });

    if (output[0].title === 'Aim' && output[1].title === 'Aim') {
      output[1].title = 'Aim (No Sliders)';
    }

    if (output[2].title === 'Stamina' && output[3].title === 'Stamina') {
      output[2].title = 'Stamina (Left)';
      output[3].title = 'Stamina (Right)';
      [output[2], output[3]] = [output[3], output[2]];
    }

    return output;
  }
  _simulateScores(attributes, options) {
    return attributes.rulesetId === exports.GameMode.Mania
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
    const scoreInfo = options.scoreInfo ?? this._scoreSimulator.simulate(options);
    const difficulty = toDifficultyAttributes(options.difficulty, ruleset.id);

    if (options.attributes.hash || options.hash) {
      scoreInfo.beatmapHashMD5 = options.attributes.hash ?? options.hash;
    }

    const performance = calculatePerformance({
      ruleset,
      scoreInfo,
      difficulty,
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

exports.BeatmapCalculator = BeatmapCalculator;
exports.ScoreCalculator = ScoreCalculator;
exports.ScoreSimulator = ScoreSimulator;
exports.calculateAccuracy = calculateAccuracy;
exports.calculateDifficulty = calculateDifficulty;
exports.calculatePerformance = calculatePerformance;
exports.calculateRank = calculateRank;
exports.createBeatmapAttributes = createBeatmapAttributes;
exports.createBeatmapInfo = createBeatmapInfo;
exports.createDifficultyCalculator = createDifficultyCalculator;
exports.downloadFile = downloadFile;
exports.generateHitStatistics = generateHitStatistics;
exports.getRulesetById = getRulesetById;
exports.getRulesetIdByName = getRulesetIdByName;
exports.getValidHitStatistics = getValidHitStatistics;
exports.parseBeatmap = parseBeatmap;
exports.parseScore = parseScore;
exports.scaleTotalScore = scaleTotalScore;
exports.toCombination = toCombination;
exports.toDifficultyAttributes = toDifficultyAttributes;
exports.toDifficultyMods = toDifficultyMods;
