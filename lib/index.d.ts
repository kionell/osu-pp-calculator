import { IBeatmap, IRuleset, DifficultyCalculator, DifficultyAttributes, IScoreInfo, PerformanceAttributes, Skill, IScore, IBeatmapInfo, IJsonableScoreInfo, IHitStatistics, ModCombination, ScoreRank, IJsonableBeatmapInfo } from 'osu-classes';
import { IDownloadEntryOptions, DownloadResult } from 'osu-downloader';

/**
 * Beatmap attributes that will be used to simulate scores.
 */
interface IBeatmapAttributes {
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

/**
 * Options for beatmap parsing.
 */
interface IBeatmapParsingOptions {
  /**
     * ID of the target beatmap.
     */
  beatmapId?: string | number;
  /**
     * Custom file URL of the target beatmap.
     */
  fileURL?: string;
  /**
     * Path to the beatmap file save location.
     */
  savePath?: string;
  /**
     * Hash of the target beatmap. Used to validate beatmap files.
     * If wasn't specified then file will not be validated.
     */
  hash?: string;
}

/**
 * Beatmap skill data.
 */
interface IBeatmapSkill {
  /**
     * Skill name.
     */
  title: string;
  /**
     * Strain peaks of this skill.
     */
  strainPeaks: number[];
}

/**
 * Raw difficulty attributes with no methods.
 */
interface IDifficultyAttributes {
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

interface IDifficultyCalculationOptions {
  /**
     * An instance of any beatmap.
     */
  beatmap?: IBeatmap;
  /**
     * An instance of any ruleset.
     */
  ruleset?: IRuleset;
  /**
     * Custom difficulty calculator.
     */
  calculator?: DifficultyCalculator;
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
 * Options for score parsing.
 */
interface IScoreParsingOptions {
  /**
     * Custom replay file URL.
     */
  replayURL?: string;
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
     * Beatmap attributes for score simulation.
     */
  attributes: IBeatmapAttributes;
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

declare enum GameMode {
  Osu = 0,
  Taiko = 1,
  Fruits = 2,
  Mania = 3
}

/**
 * Difficulty calculator that can return skill data.
 */
interface IExtendedDifficultyCalculator extends DifficultyCalculator {
  /**
     * Get current skill list.
     */
  getSkills(): Skill[];
}
/**
 * Factory of extended difficulty calculators.
 * @param beatmap IBeatmap object.
 * @param ruleset Ruleset instance.
 * @returns Instance of extended difficulty calculator.
 */
declare function createDifficultyCalculator(beatmap: IBeatmap, ruleset: IRuleset): IExtendedDifficultyCalculator;

declare type BeatmapParsingResult = {
  data: IBeatmap;
  hash: string;
};
declare type ScoreParsingResult = {
  data: IScore;
  hash: string;
};
/**
 * Tries to parse beatmap by beatmap ID or custom file URL.
 * @param options Beatmap parsing options.
 * @returns Parsed beatmap.
 */
declare function parseBeatmap(options: IBeatmapParsingOptions): Promise<BeatmapParsingResult>;
/**
 * Downloads replay file and tries to parse a score from it.
 * Returns null if parsing was not successful.
 * @param options Score parsing options.
 * @returns Parsed score.
 */
declare function parseScore(options: IScoreParsingOptions): Promise<ScoreParsingResult>;

/**
 * A score simulator.
 */
declare class ScoreSimulator {
  /**
     * Simulates a score by a replay file.
     * @param replayURL Replay file URL.
     * @param attributes Beatmap attributes of this score.
     * @returns Simulated score.
     */
  simulateReplay(replayURL: string, attributes: IBeatmapAttributes): Promise<IScoreInfo>;
  /**
     * Simulates a score by score simulation options.
     * @param options Score simulation options.
     * @returns Simulated score.
     */
  simulate(options: IScoreSimulationOptions): IScoreInfo;
  /**
     * Simulates a new score with full combo.
     * @param scoreInfo Original score.
     * @param attributes Beatmap attributes of this score.
     * @returns Simulated FC score.
     */
  simulateFC(scoreInfo: IScoreInfo, attributes: IBeatmapAttributes): IScoreInfo;
  /**
     * Simulates a new score with max possible performance.
     * @param attributes Beatmap attributes of this score.
     * @returns Simulated SS score.
     */
  simulateMax(attributes: IBeatmapAttributes): IScoreInfo;
  private _generateScoreInfo;
}

/**
 * Converts IBeatmap object to beatmap information.
 * @param beatmap IBeatmap object.
 * @param hash Beatmap MD5 hash.
 * @returns Converted beatmap info.
 */
declare function createBeatmapInfo(beatmap?: IBeatmap, hash?: string): IBeatmapInfo;
/**
 * Converts IBeatmap object to beatmap attributes.
 * @param beatmap IBeatmap object.
 * @returns Converted beatmap attributes.
 */
declare function createBeatmapAttributes(beatmap?: IBeatmap): IBeatmapAttributes;

/**
 * Converts raw difficulty attributes to real difficulty attributes.
 * @param difficulty Raw difficulty attributes.
 * @returns Difficulty attributes instance.
 */
declare function toDifficultyAttributes(difficulty?: IDifficultyAttributes, rulesetId?: GameMode): DifficultyAttributes;
/**
 * Converts score information object to score information instance.
 * @param jsonable Raw score info data.
 * @returns Converted score information.
 */
declare function toScoreInfo(data?: IScoreInfo | IJsonableScoreInfo): IScoreInfo;

/**
 * Downloads an osu! file by ID or URL.
 * @param path Path to the file save location.
 * @param options Download options.
 * @returns Download result.
 */
declare function downloadFile(path?: string, options?: IDownloadEntryOptions): Promise<DownloadResult>;

declare function generateHitStatistics(attributes: IBeatmapAttributes, accuracy?: number, countMiss?: number, count50?: number, count100?: number): Partial<IHitStatistics>;
declare function getValidHitStatistics(original?: Partial<IHitStatistics>): IHitStatistics;

/**
 * Filters mods from combination to get only difficulty mods.
 * @param mods Original mods.
 * @param rulesetId Target ruleset ID.
 * @returns Difficulty mods.
 */
declare function toDifficultyMods(mods?: string | number, rulesetId?: number): ModCombination;
/**
 * Converts unknown input to mod combination.
 * @param mods Original mods.
 * @param rulesetId Target ruleset ID.
 * @returns Mod combination.
 */
declare function toCombination(mods?: string | number, rulesetId?: number): ModCombination;

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
 * Scales total score of a play with mod multipliers.
 * @param totalScore Original total score.
 * @returns Scaled total score.
 */
declare function scaleTotalScore(totalScore: number, mods?: ModCombination | null): number;
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
     * Precalculated beatmap information.
     */
  beatmapInfo?: IBeatmapInfo | IJsonableBeatmapInfo;
  /**
     * Beatmap attributes for score simulation.
     */
  attributes?: IBeatmapAttributes;
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
  difficulty?: IDifficultyAttributes;
  /**
     * Output strain peaks or not.
     */
  strains?: boolean;
  /**
     * List of accuracy for all game modes except osu!mania.
     */
  accuracy?: number[];
  /**
     * List of total scores for osu!mania game mode.
     */
  totalScores?: number[];
}

/**
 * Calculated beatmap.
 */
interface ICalculatedBeatmap {
  /**
     * Beatmap information.
     */
  beatmapInfo: IJsonableBeatmapInfo;
  /**
     * Beatmap missing attributes.
     */
  attributes: IBeatmapAttributes;
  /**
     * Beatmap skill data.
     */
  skills: IBeatmapSkill[] | null;
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
     * Score information.
     */
  scoreInfo: IJsonableScoreInfo;
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
interface IScoreCalculationOptions extends IScoreParsingOptions, Partial<IScoreSimulationOptions> {
  /**
     * Beatmap ID of this score.
     */
  beatmapId?: number;
  /**
     * Custom beatmap file URL of this score.
     */
  fileURL?: string;
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
  difficulty?: IDifficultyAttributes;
  /**
     * Target score.
     */
  scoreInfo?: IScoreInfo | IJsonableScoreInfo;
  /**
     * Should this score be unchoked or not?
     */
  fix?: boolean;
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
     * This is the special case in which all precalculated stuff is present.
     * @param options Beatmap calculation options.
     * @returns Calculated beatmap.
     */
  private _processPrecalculated;
  /**
     * Tests these beatmap calculation options for the possibility of skipping beatmap parsing.
     * @param options Beatmap calculation options.
     * @returns If these options enough to skip beatmap parsing.
     */
  private _checkPrecalculated;
  /**
     * Transforms skill data to get strain peaks.
     * @param calculator Extended difficulty calculator.
     * @returns Skill output data.
     */
  private _getSkillsOutput;
  /**
     * Simulates custom scores by accuracy or total score values.
     * @param attributes Beatmap attributes.
     * @param options Beatmap calculation options.
     * @returns Simulated scores.
     */
  private _simulateScores;
  /**
     * Simulates custom scores by accuracy values.
     * @param attributes Beatmap attributes.
     * @param accuracy Accuracy values.
     * @returns Simulated scores.
     */
  private _simulateOtherScores;
  /**
     * Simulates custom osu!mania scores by total score values.
     * @param attributes Beatmap attributes.
     * @param totalScores Total score values.
     * @returns Simulated osu!mania scores.
     */
  private _simulateManiaScores;
}

/**
 * A score calculator.
 */
declare class ScoreCalculator {
  /**
     * Instance of a score simulator.
     */
  private _scoreSimulator;
  /**
     * Calculates difficulty and performance of a score.
     * @param options Score calculation options.
     * @returns Calculated score.
     */
  calculate(options: IScoreCalculationOptions): Promise<ICalculatedScore>;
  /**
     * This is the special case in which all precalculated stuff is present.
     * @param options Score calculation options.
     * @returns Calculated score.
     */
  private _processPrecalculated;
  private _getScoreInfo;
  /**
     * Tests these score calculation options for the possibility of skipping beatmap parsing.
     * @param options Score calculation options.
     * @returns If these options enough to skip beatmap parsing.
     */
  private _checkPrecalculated;
}

export { BeatmapCalculator, GameMode, IBeatmapAttributes, IBeatmapCalculationOptions, IBeatmapParsingOptions, IBeatmapSkill, ICalculatedBeatmap, ICalculatedScore, IDifficultyAttributes, IDifficultyCalculationOptions, IExtendedDifficultyCalculator, IPerformanceCalculationOptions, IScoreCalculationOptions, IScoreParsingOptions, IScoreSimulationOptions, ScoreCalculator, ScoreSimulator, calculateAccuracy, calculateDifficulty, calculatePerformance, calculateRank, createBeatmapAttributes, createBeatmapInfo, createDifficultyCalculator, downloadFile, generateHitStatistics, getRulesetById, getRulesetIdByName, getValidHitStatistics, parseBeatmap, parseScore, scaleTotalScore, toCombination, toDifficultyAttributes, toDifficultyMods, toScoreInfo };
