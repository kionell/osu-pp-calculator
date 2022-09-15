import { readFileSync } from 'fs';
import { DownloadType } from 'osu-downloader';
import { BeatmapDecoder, ScoreDecoder } from 'osu-parsers';
import type { IBeatmap, IScore } from 'osu-classes';
import type { IBeatmapParsingOptions, IScoreParsingOptions } from './Interfaces';
import { downloadFile } from './Utils';

type BeatmapParsingResult = {
  data: IBeatmap;
  hash: string;
};

type ScoreParsingResult = {
  data: IScore;
  hash: string;
};

/**
 * Tries to parse beatmap by beatmap ID or custom file URL.
 * @param options Beatmap parsing options.
 * @returns Parsed beatmap.
 */
export async function parseBeatmap(options: IBeatmapParsingOptions): Promise<BeatmapParsingResult> {
  const { beatmapId, fileURL, hash, savePath } = options;

  if (beatmapId && parseInt(beatmapId as string)) {
    return parseBeatmapById(beatmapId, hash, savePath);
  }

  if (fileURL) {
    return parseCustomBeatmap(fileURL, hash, savePath);
  }

  throw new Error('No beatmap ID or beatmap URL was specified!');
}

/**
 * Downloads beatmap by its ID and tries to parse it.
 * @param id Beatmap ID.
 * @param hash Original hash to validate downloaded file.
 * @param savePath The path where this file should be saved.
 * @returns Parsed beatmap.
 */
async function parseBeatmapById(id: string | number, hash?: string, savePath?: string): Promise<BeatmapParsingResult> {
  const result = await downloadFile(savePath, {
    save: typeof savePath === 'string',
    id,
  });

  if (!result.isSuccessful || (!savePath && !result.buffer)) {
    throw new Error(`Beatmap with ID "${id}" failed to download: "${result.statusText}"`);
  }

  if (hash && hash !== result.md5) {
    throw new Error('Beatmap MD5 hash missmatch!');
  }

  const data = savePath
    ? readFileSync(result.filePath as string)
    : result.buffer as Buffer;

  const parsed = parseBeatmapData(data);

  // This is done because very old beatmaps sometimes don't have beatmap ID.
  parsed.metadata.beatmapId ||= parseInt(id as string);

  return {
    hash: result.md5 as string,
    data: parsed,
  };
}

/**
 * Downloads custom beatmap file and tries to parse it.
 * @param url Custom beatmap file URL.
 * @param hash Original hash to validate downloaded file.
 * @param savePath The path where this file should be saved.
 * @returns Parsed beatmap.
 */
async function parseCustomBeatmap(url: string, hash?: string, savePath?: string): Promise<BeatmapParsingResult> {
  const result = await downloadFile(savePath, {
    save: typeof savePath === 'string',
    url,
  });

  if (!result.isSuccessful || (!savePath && !result.buffer)) {
    throw new Error(`Beatmap from "${url}" failed to download: ${result.statusText}`);
  }

  if (hash && hash !== result.md5) {
    throw new Error('Beatmap MD5 hash missmatch!');
  }

  const data = savePath
    ? readFileSync(result.filePath as string)
    : result.buffer as Buffer;

  return {
    data: parseBeatmapData(data),
    hash: result.md5 as string,
  };
}

/**
 * Tries to parse beatmap file data.
 * @param data Beatmap file data.
 * @returns Parsed beatmap.
 */
function parseBeatmapData(data: Buffer): IBeatmap {
  const stringified = data.toString();

  const decoder = new BeatmapDecoder();
  const parseStoryboard = false;

  return decoder.decodeFromString(stringified, parseStoryboard);
}

/**
 * Downloads replay file and tries to parse a score from it.
 * Returns null if parsing was not successful.
 * @param options Score parsing options.
 * @returns Parsed score.
 */
export async function parseScore(options: IScoreParsingOptions): Promise<ScoreParsingResult> {
  const { replayURL, hash, lifeBar } = options;

  if (typeof replayURL === 'string') {
    return parseCustomScore(replayURL, hash, lifeBar);
  }

  throw new Error('No replay URL was specified!');
}

/**
 * Downloads custom replay file and tries to parse it.
 * @param url Custom replay file URL.
 * @param hash Original hash to validate downloaded file.
 * @param parseReplay Should replay be parsed or not?
 * @returns Parsed score.
 */
async function parseCustomScore(url: string, hash?: string, parseReplay = false): Promise<ScoreParsingResult> {
  const result = await downloadFile('', {
    type: DownloadType.Replay,
    save: false,
    url,
  });

  if (!result.isSuccessful || !result.buffer) {
    throw new Error('Replay failed to download!');
  }

  if (hash && hash !== result.md5) {
    throw new Error('Replay MD5 hash missmatch!');
  }

  return {
    data: await parseScoreData(result.buffer, parseReplay),
    hash: result.md5 as string,
  };
}

/**
 * Tries to parse score file data.
 * @param data Score file data.
 * @param parseReplay Should replay be parsed or not?
 * @returns Parsed score.
 */
async function parseScoreData(data: Buffer, parseReplay = false): Promise<IScore> {
  return await new ScoreDecoder().decodeFromBuffer(data, parseReplay);
}
