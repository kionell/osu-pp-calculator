import {
  Downloader,
  DownloadEntry,
  DownloadResult,
  IDownloadEntryOptions,
} from 'osu-downloader';

/**
 * Downloads an osu! file by ID or URL.
 * @param path Path to the file save location.
 * @param options Download options.
 * @returns Download result.
 */
export async function downloadFile(path?: string, options?: IDownloadEntryOptions): Promise<DownloadResult> {
  const downloader = new Downloader({ rootPath: path });
  const entry = new DownloadEntry(options);

  await downloader.addSingleEntry(entry);

  return downloader.downloadSingle();
}
