import md5 from 'md5';
import { readFileSync } from 'fs';
import { DownloadType } from 'osu-downloader';
import { BeatmapDecoder, ScoreDecoder } from 'osu-parsers';
import type { IBeatmap, IScore } from 'osu-classes';

import type {
  IBeatmapParsingOptions,
  IScoreParsingOptions,
} from './Interfaces';

import { downloadFile } from './Utils';

/**
 * Tries to parse beatmap by beatmap ID or custom file URL.
 * @param options Beatmap parsing options.
 * @returns Parsed beatmap.
 */
export async function parseBeatmap(options: IBeatmapParsingOptions): Promise<IBeatmap> {
  const { beatmapId, fileURL, hash, savePath } = options;

  if (typeof beatmapId === 'string' || typeof beatmapId === 'number') {
    return parseBeatmapById(beatmapId, hash, savePath);
  }

  if (typeof fileURL === 'string') {
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
async function parseBeatmapById(id: string | number, hash?: string, savePath?: string): Promise<IBeatmap> {
  const result = await downloadFile(savePath, {
    save: typeof savePath === 'string',
    id,
  });

  if (!result.isSuccessful || (!savePath && !result.buffer)) {
    throw new Error(`${result.fileName} failed to download!`);
  }

  const data = savePath
    ? readFileSync(result.filePath as string)
    : result.buffer as Buffer;

  const parsed = parseBeatmapData(data, hash);

  parsed.metadata.beatmapId ||= parseInt(id as string);

  return parsed;
}

/**
 * Downloads custom beatmap file and tries to parse it.
 * @param url Custom beatmap file URL.
 * @param hash Original hash to validate downloaded file.
 * @param savePath The path where this file should be saved.
 * @returns Parsed beatmap.
 */
async function parseCustomBeatmap(url: string, hash?: string, savePath?: string): Promise<IBeatmap> {
  const result = await downloadFile(savePath, {
    save: typeof savePath === 'string',
    url,
  });

  if (!result.isSuccessful || (!savePath && !result.buffer)) {
    throw new Error('Custom beatmap failed to download!');
  }

  const data = savePath
    ? readFileSync(result.filePath as string)
    : result.buffer as Buffer;

  return parseBeatmapData(data, hash);
}

/**
 * Tries to parse beatmap file data.
 * @param data Beatmap file data.
 * @param hash Original hash of the file.
 * @returns Parsed beatmap.
 */
function parseBeatmapData(data: Buffer, hash?: string): IBeatmap {
  const stringified = data.toString();

  /**
   * Compare original hash with hash of a file.
   */
  if (hash && hash !== md5(stringified)) {
    throw new Error('Wrong beatmap file!');
  }

  const decoder = new BeatmapDecoder();
  const parseSb = false;

  return decoder.decodeFromString(stringified, parseSb);
}

/**
 * Downloads replay file and tries to parse a score from it.
 * Returns null if parsing was not successful.
 * @param options Score parsing options.
 * @returns Parsed score.
 */
export async function parseScore(options: IScoreParsingOptions): Promise<IScore> {
  const { fileURL, hash } = options;

  if (typeof fileURL === 'string') {
    return parseCustomScore(fileURL, hash);
  }

  throw new Error('No replay URL was specified!');
}

/**
 * Downloads custom replay file and tries to parse it.
 * @param url Custom replay file URL.
 * @param hash Original hash to validate downloaded file.
 * @returns Parsed score.
 */
async function parseCustomScore(url: string, hash?: string): Promise<IScore> {
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

/**
 * Tries to parse score file data.
 * @param data Score file data.
 * @param hash Original hash of the file.
 * @returns Parsed score.
 */
async function parseScoreData(data: Buffer, hash?: string): Promise<IScore> {
  /**
   * Compare original hash with hash of a file.
   */
  if (hash && hash !== md5(data)) {
    throw new Error('Wrong beatmap file!');
  }

  const decoder = new ScoreDecoder();
  const parseReplay = false;

  return decoder.decodeFromBuffer(data, parseReplay);
}
