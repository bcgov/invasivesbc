import { CacheDownloadMode } from 'utils/record-cache';

/**
 * @desc Generic Base Class for All Caching actions using SQLite or LocalForage ensuring consistency between all Database implementations
 * @property { RepoMetadata } _ All Details contained by a Metadata Entry
 * @property { RepositoryDownloadRequestSpec } _ Information details for a Download e.g. API Url, Cache Targets, bounding boxes
 * @property { ProgressCallbackParams } _ Details for Callback Functionality, used for Progress bars, updates
 * @property { RepositoryStatusSchema } _ Enum for Cache Statuses, e.g. READY, CACHED, ERROR, etc
 * @example Implementation abstract Class Demo extends BaseCacheService<
 *            RepoMetadataType
 *            RepositoryDownloadRequestSpecType
 *            RepoProgressCallbackParamsType
 *            RepositoryStatusSchemeType>
 */
abstract class BaseCacheService<
  RepoMetadata,
  RepositoryDownloadRequestSpec,
  ProgressCallbackParams,
  RepositoryStatusSchema
> {
  /** Update any details for a Repository */
  protected abstract addOrUpdateRepository(repositoryId: RepoMetadata): Promise<void>;

  /** Remove one Repository from the collection along with its contentes */
  public abstract deleteRepository(repositoryId: string): Promise<void>;

  /** Pull metadata for one Repository in the Collection */
  public abstract getRepository(repositoryId: string): Promise<RepoMetadata | null>;

  /** List metadata for all Repositories */
  public abstract listRepositories(): Promise<RepoMetadata[]>;

  /** Change the status for a given Repository */
  public abstract setRepositoryStatus(repositoryId: string, status: RepositoryStatusSchema): Promise<void>;

  /** Download a new Repository along with its contents */
  public abstract download(
    spec: RepositoryDownloadRequestSpec,
    progressCallback?: (currentProgress: ProgressCallbackParams) => void
  ): Promise<CacheDownloadMode | void>;

  /**
   * @desc Concurrency helper. If one call fails, makes a second attempt before failing over.
   * @param executing Promises in progress
   * @param promiseFn Promises to Execute
   */
  protected async processNext(executing: Set<Promise<void>>, promiseFn: () => Promise<void>) {
    const promise = promiseFn();
    executing.add(promise);
    try {
      await promise;
    } catch (e) {
      console.error(e);
      try {
        await promise;
      } catch (e) {
        console.error('Failed second attempt at Promise');
        throw e;
      }
    } finally {
      executing.delete(promise);
    }
  }

  protected constructor() {}
}

export default BaseCacheService;
