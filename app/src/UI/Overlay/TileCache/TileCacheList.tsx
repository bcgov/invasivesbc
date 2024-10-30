import TileCache from 'state/actions/cache/TileCache';
import { useDispatch, useSelector } from 'utils/use_selector';
import TileCacheListRow from './TileCacheListRow';

const TileCacheList = () => {
  const repositories = useSelector((state) => state.TileCache?.repositories);
  const visibleLayers = useSelector((state) => state.Map.enabledOverlayLayers) ?? [];
  const dispatch = useDispatch();
  if (!repositories || repositories.length === 0) {
    return (
      <section>
        <p>You don't have any map areas saved on your device right now.</p>
      </section>
    );
  }
  return (
    <section>
      <table>
        <thead>
          <tr>
            <th>Show</th>
            <th>Name</th>
            <th>Status</th>
            <th>Tile Count</th>
            <th>Cache Size</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {repositories.map((r) => (
            <TileCacheListRow key={r.id} metadata={r} visible={visibleLayers.includes(r?.id)} />
          ))}
        </tbody>
      </table>
      <p>
        You can toggle the visibility of cached map tiles here, or from the <b>Layer Picker</b>
      </p>
      <div className="control">
        <button onClick={() => dispatch(TileCache.repositoryList())}>Refresh Table</button>
      </div>
    </section>
  );
};

export { TileCacheList };
