import { IBeatmap, IRuleset, DifficultyAttributes, IScoreInfo, PerformanceAttributes, ModCombination, IScore, IBeatmapInfo, HitType, IHitStatistics, ScoreRank } from 'osu-classes';
import { IDownloadEntryOptions, DownloadResult } from 'osu-downloader';

/**
 * Options for beatmap parsing.
 */
interface IBeatmapParsingOptions {
  /**
     * ID of the target beatmap.
     */
  beatmapId?: string | number;
  /**
     * Path to the beatmap file save location.
     */
  savePath?: string;
  /**
     * Custom file URL of the target beatmap.
     */
  fileURL?: string;
  /**
     * Hash of the target beatmap. Used to validate beatmap files.
     * If wasn't specified then file will not be validated.
     */
  hash?: string;
}

interface IDifficultyCalculationOptions {
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

/**
 * Options for performance calculation of a score.
 */
interface IPerformanceCalculationOptions {
  /**
     * Difficulty attributes of the target beatmap.
     */
  difficulty: DifficultyAttributes;
  /**
     * Target score information.
     */
  scoreInfo: IScoreInfo;
  /**
     * An instance of any ruleset.
     */
  ruleset: IRuleset;
}

/**
 * Options for beatmap parsing.
 */
interface IScoreParsingOptions {
  /**
     * Custom file URL of the target replay.
     */
  fileURL?: string;
  /**
     * Path to the replay file save location.
     */
  savePath?: string;
  /**
     * Hash of the target replay. Used to validate beatmap files.
     * If wasn't specified then file will not be validated.
     */
  hash?: string;
}

/**
 * Options for score simulation.
 */
interface IScoreSimulationOptions {
  /**
     * Target beatmap.
     */
  beatmap: IBeatmap;
  /**
     * Target score misses.
     */
  countMiss?: number;
  /**
     * Target score 50's.
     */
  count50?: number;
  /**
     * Target score 100's.
     */
  count100?: number;
  /**
     * Target score accuracy.
     */
  accuracy?: number;
  /**
     * Target total score.
     */
  totalScore?: number;
  /**
     * Target max combo of a score.
     */
  maxCombo?: number;
  /**
     * Target percent of max combo of a score.
     */
  percentCombo?: number;
}

/**
 * Calculates difficulty attributes by ID, custom file or IBeatmap object.
 * @param options Difficulty attributes request options.
 * @returns Calculated difficulty attributes.
 */
declare function calculateDifficulty(options: IDifficultyCalculationOptions): DifficultyAttributes;
/**
 * Calculates difficulty attributes by ID, custom file or IBeatmap object.
 * @param options Difficulty attributes request options.
 * @returns Calculated difficulty attributes.
 */
declare function calculatePerformance(options: IPerformanceCalculationOptions): PerformanceAttributes;
/**
 * Filters mods from combination to get only difficulty mods.
 * @param mods Original mods.
 * @param ruleset Target ruleset.
 * @returns Difficulty mods.
 */
declare function getDifficultyMods(ruleset: IRuleset, mods: string | number): ModCombination;

declare enum GameMode {
  Osu = 0,
  Taiko = 1,
  Fruits = 2,
  Mania = 3
}

/**
 * Tries to parse beatmap by beatmap ID or custom file URL.
 * @param options Beatmap parsing options.
 * @returns Parsed beatmap.
 */
declare function parseBeatmap(options: IBeatmapParsingOptions): Promise<IBeatmap>;
/**
 * Downloads replay file and tries to parse a score from it.
 * Returns null if parsing was not successful.
 * @param options Score parsing options.
 * @returns Parsed score.
 */
declare function parseScore(options: IScoreParsingOptions): Promise<IScore>;

/**
 * A score simulator.
 */
declare class ScoreSimulator {
  /**
     * Simulates a score by score simulation options.
     * @param options Score simulation options.
     * @returns Simulated score.
     */
  simulate(options: IScoreSimulationOptions): IScoreInfo;
  /**
     * Simulates a new score with full combo.
     * @param scoreInfo Original score.
     * @param beatmap Beatmap of the score.
     * @returns Simulated FC score.
     */
  simulateFC(scoreInfo: IScoreInfo, beatmap: IBeatmap): IScoreInfo;
  /**
     * Simulates a new score with max possible performance.
     * @param beatmap Beatmap of the score.
     * @returns Simulated SS score.
     */
  simulateMax(beatmap: IBeatmap): IScoreInfo;
  private _generateScoreInfo;
}

/**
 * Converts beatmap to beatmap information.
 * @param beatmap IBeatmap object.
 * @returns Converted beatmap info.
 */
declare function createBeatmapInfoFromBeatmap(beatmap: IBeatmap): IBeatmapInfo;
/**
 * Counts the number of objects of the specific hit type.
 * @param beatmap IBeatmap object.
 * @param hitType Hit type to be calculated.
 * @returns Number of objects of this hit type.
 */
declare function countObjects(beatmap: IBeatmap, hitType: HitType): number;
/**
 * Counts the number of nested fruits in the beatmap.
 * @param beatmap IBeatmap object.
 * @returns Number of nested fruits.
 */
declare function countFruits(beatmap: IBeatmap): number;
/**
 * Counts the number of nested droplets in the beatmap.
 * @param beatmap IBeatmap object.
 * @returns Number of nested droplets.
 */
declare function countDroplets(beatmap: IBeatmap): number;
/**
 * Counts the number of nested tiny droplets in the beatmap.
 * @param beatmap IBeatmap object.
 * @returns Number of nested tiny droplets.
 */
declare function countTinyDroplets(beatmap: IBeatmap): number;
/**
 * Calculates total hits of a beatmap.
 * @param beatmap IBeatmap object.
 * @returns Total hits of a beatmap or 0.
 */
declare function getTotalHits(beatmap: IBeatmap): number;
/**
 * Tries to get max combo of a beatmap.
 * @param beatmap IBeatmap object.
 * @returns Max combo of a beatmap or 0.
 */
declare function getMaxCombo(beatmap: IBeatmap): number;
/**
 * Tries to get mod combination from IBeatmap object.
 * @param beatmap IBeatmap object.
 * @returns Mod combination or null.
 */
declare function getMods(beatmap: IBeatmap): ModCombination | null;

/**
 * Downloads an osu! file by ID or URL.
 * @param path Path to the file save location.
 * @param options Download options.
 * @returns Download result.
 */
declare function downloadFile(path: string, options?: IDownloadEntryOptions): Promise<DownloadResult>;

declare function generateHitStatistics(beatmap: IBeatmap, accuracy?: number, countMiss?: number, count50?: number, count100?: number): Partial<IHitStatistics>;
declare function getValidHitStatistics(original?: Partial<IHitStatistics>): IHitStatistics;

/**
 * Converts ruleset name to ruleset ID.
 * @param rulesetName Ruleset name.
 * @returns Ruleset ID.
 */
declare function getRulesetIdByName(rulesetName?: string): GameMode;
/**
 * Creates a new ruleset instance by its ID.
 * @param rulesetId Ruleset ID.
 * @returns Ruleset instance.
 */
declare function getRulesetById(rulesetId?: number): IRuleset;

/**
 * Calculates accuracy of a score.
 * @param scoreInfo Score information.
 * @returns Calculated accuracy.
 */
declare function calculateAccuracy(scoreInfo: IScoreInfo): number;
/**
 * Calculates rank of a score.
 * @param scoreInfo Score information.
 * @returns Calculated score rank.
 */
declare function calculateRank(scoreInfo: IScoreInfo): ScoreRank;

/**
 * Options for beatmap calculation.
 */
interface IBeatmapCalculationOptions extends IBeatmapParsingOptions {
  /**
     * Any beatmap. This can be used to skip beatmap parsing process.
     */
  beatmap?: IBeatmap;
  /**
     * Ruleset ID.
     */
  rulesetId?: GameMode;
  /**
     * Custom ruleset instance.
     */
  ruleset?: IRuleset;
  /**
     * Mod combination or bitwise.
     */
  mods?: string | number;
  /**
     * Precalculated difficulty attributes.
     */
  difficulty?: DifficultyAttributes;
  /**
     * List of total scores for osu!mania or list of accuracy for other game modes.
     */
  values?: number[];
}

/**
 * Calculated beatmap.
 */
interface ICalculatedBeatmap {
  /**
     * Parsed beatmap with applied ruleset.
     */
  beatmap: IBeatmap;
  /**
     * Difficulty attributes of calculated beatmap.
     */
  difficulty: DifficultyAttributes;
  /**
     * List of performance attributes of calculated beatmap.
     */
  performance: PerformanceAttributes[];
}

/**
 * Calculated score.
 */
interface ICalculatedScore {
  /**
     * Parsed beatmap with applied ruleset.
     */
  beatmap: IBeatmap;
  /**
     * Score information.
     */
  scoreInfo: IScoreInfo;
  /**
     * Difficulty attributes of calculated beatmap.
     */
  difficulty: DifficultyAttributes;
  /**
     * List of performance attributes of calculated beatmap.
     */
  performance: PerformanceAttributes;
}

/**
 * Options for score calculation.
 */
interface IScoreCalculationOptions extends IBeatmapParsingOptions {
  /**
     * Any beatmap. This can be used to skip beatmap parsing process.
     */
  beatmap?: IBeatmap;
  /**
     * Ruleset ID.
     */
  rulesetId?: GameMode;
  /**
     * Custom ruleset instance.
     */
  ruleset?: IRuleset;
  /**
     * Mod combination or bitwise.
     */
  mods?: string | number;
  /**
     * Precalculated difficulty attributes.
     */
  difficulty?: DifficultyAttributes;
  /**
     * Target score.
     */
  scoreInfo?: IScoreInfo;
}

/**
 * A beatmap calculator.
 */
declare class BeatmapCalculator {
  /**
     * Instance of a score simulator.
     */
  private _scoreSimulator;
  /**
     * Calculates difficulty and performance of a beatmap.
     * @param options Beatmap calculation options.
     * @returns Calculated beatmap.
     */
  calculate(options: IBeatmapCalculationOptions): Promise<ICalculatedBeatmap>;
  /**
     * Simulates custom scores by accuracy or total score values.
     * @param beatmap IBeatmap object.
     * @param values Accuracy or total score values.
     * @returns Simulated scores.
     */
  private _simulateScores;
  /**
     * Tries to get ruleset instance from beatmap calculation options.
     * @param options Beatmap calculation options.
     * @returns Ruleset instance.
     */
  private _getRuleset;
  /**
     * Tries to get parsed beatmap instance from beatmap calculation options.
     * @param ruleset Ruleset instance.
     * @param options Beatmap calculation options.
     * @returns Parsed beatmap instance.
     */
  private _getBeatmap;
}

/**
 * A score calculator.
 */
declare class ScoreCalculator {
  /**
     * Calculates difficulty and performance of a score.
     * @param options Score calculation options.
     * @returns Calculated score.
     */
  calculate(options: IScoreCalculationOptions): Promise<ICalculatedScore>;
  /**
     * Tries to get ruleset instance from beatmap calculation options.
     * @param options Beatmap calculation options.
     * @returns Ruleset instance.
     */
  private _getRuleset;
  /**
     * Tries to get ruleset instance from beatmap calculation options.
     * @param options Beatmap calculation options.
     * @returns Ruleset instance.
     */
  private _getScore;
  /**
     * Tries to get parsed beatmap instance from beatmap calculation options.
     * @param ruleset Ruleset instance.
     * @param options Beatmap calculation options.
     * @returns Parsed beatmap instance.
     */
  private _getBeatmap;
}

export { BeatmapCalculator, GameMode, IBeatmapCalculationOptions, IBeatmapParsingOptions, ICalculatedBeatmap, ICalculatedScore, IDifficultyCalculationOptions, IPerformanceCalculationOptions, IScoreCalculationOptions, IScoreParsingOptions, IScoreSimulationOptions, ScoreCalculator, ScoreSimulator, calculateAccuracy, calculateDifficulty, calculatePerformance, calculateRank, countDroplets, countFruits, countObjects, countTinyDroplets, createBeatmapInfoFromBeatmap, downloadFile, generateHitStatistics, getDifficultyMods, getMaxCombo, getMods, getRulesetById, getRulesetIdByName, getTotalHits, getValidHitStatistics, parseBeatmap, parseScore };
