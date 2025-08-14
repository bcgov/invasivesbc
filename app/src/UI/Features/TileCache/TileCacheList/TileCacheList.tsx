import TileCache from 'state/actions/cache/TileCache';
import { useDispatch, useSelector } from 'utils/use_selector';
import TileCacheListRow from 'UI/Features/TileCache/TileCacheListRow';
import { RepositoryStatus } from 'utils/tile-cache';
import '../commonOfflineMap.css';

const TileCacheList = () => {
  const repositories = useSelector((state) => state.TileCache?.repositories ?? []).filter(
    (r) => r.status === RepositoryStatus.READY
  );

  const dispatch = useDispatch();
  if (!repositories || repositories.length === 0) {
    return (
      <div>
        <p>You don't have any map areas saved on your device right now.</p>
      </div>
    );
  }
  return (
    <div className="cached-map-status-details">
      <div className="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Status</th>
              <th>Tile Count</th>
              <th>Cache Size</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {repositories.map((r) => (
              <TileCacheListRow key={r.id} metadata={r} />
            ))}
          </tbody>
        </table>
      </div>
      <p>
        You can toggle the visibility of cached map tiles from the <b>Layer Picker</b>
      </p>
      <div className="control">
        <button onClick={() => dispatch(TileCache.repositoryList())}>Refresh Table</button>
      </div>
    </div>
  );
};

export { TileCacheList };
