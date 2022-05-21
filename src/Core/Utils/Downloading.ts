import {
  Downloader,
  DownloadEntry,
  DownloadResult,
  IDownloadEntryOptions,
  DownloadStatus,
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

/**
 * Converts download status to a readable string.
 * @param status Download status.
 * @returns Readable download status.
 */
export function formatDownloadStatus(status: DownloadStatus): string {
  switch (status) {
    case DownloadStatus.FailedToDownload:
      return 'Not Found';

    case DownloadStatus.FailedToRead:
      return 'Failed To Read';

    case DownloadStatus.FailedToWrite:
      return 'Failed To Write';

    case DownloadStatus.FileExists:
      return 'Already Exists';

    case DownloadStatus.Downloaded:
      return 'Downloaded Successfuly';

    case DownloadStatus.Written:
      return 'Written Successfuly';
  }
}
