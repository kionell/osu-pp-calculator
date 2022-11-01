import {
  Downloader,
  DownloadEntry,
  DownloadResult,
  IDownloadEntryOptions,
} from 'osu-downloader';

// Create a global downloader instance to prevent 429 error.
const downloader = new Downloader();

/**
 * Downloads an osu! file by ID or URL.
 * @param path Path to the file save location.
 * @param options Download options.
 * @returns Download result.
 */
export async function downloadFile(path?: string, options?: IDownloadEntryOptions): Promise<DownloadResult> {
  if (downloader.rootPath !== path) {
    downloader.updateSettings({ rootPath: path });
  }

  const entry = new DownloadEntry(options);

  downloader.addSingleEntry(entry);

  return downloader.downloadSingle();
}
