import { IconButton } from '@mui/material';
import TileCache from 'state/actions/cache/TileCache';
import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'utils/use_selector';
import { RepositoryStatistics, TileCacheService } from 'utils/tile-cache';
import { TileCacheServiceFactory } from 'utils/tile-cache/context';
import { Delete, Edit } from '@mui/icons-material';
import Prompt from 'state/actions/prompts/Prompt';
import { convertBytesToReadableString } from 'utils/tile-cache/helpers';
import PlanMyTrip from 'state/actions/planMyTrip/PlanMyTrip';

const TileCacheListRow = ({ metadata }) => {
  const updateStatistics = async () => {
    if (!serviceRef.current) return;
    serviceRef.current.getRepositoryStatistics(metadata.id).then((value) => setStats(value));
  };

  const handleEditCacheDescription = () => {
    const callback = (newName: string) => {
      dispatch(TileCache.updateDescription({ repository: metadata.id, newDescription: newName }));
    };
    dispatch(
      Prompt.text({
        title: 'Edit Cache Name',
        prompt: `Enter the new name to assign "${metadata.description || metadata.id}".`,
        min: 1,
        max: 50,
        regex: /^(?!\s*$).+/,
        regexErrorText: 'New name cannot be only whitespace',
        callback
      })
    );
  };

  const handleDelete = () => {
    const callback = (confirmation: boolean) => {
      if (confirmation) {
        dispatch(PlanMyTrip.delete(metadata.id));
      }
    };
    dispatch(
      Prompt.confirmation({
        title: 'Delete Cached Map Area?',
        prompt: [
          'Do you want to delete this set of map area?',
          'They will no longer be available for offline use.',
          `Cache "${metadata.description || metadata.id}"`
        ],
        callback
      })
    );
  };

  const dispatch = useDispatch();
  const serviceRef = useRef<TileCacheService>();
  const [stats, setStats] = useState<RepositoryStatistics>();

  useEffect(() => {
    (async () => {
      serviceRef.current = await TileCacheServiceFactory.getPlatformInstance();
      updateStatistics();
    })();
  }, []);

  useEffect(() => {
    updateStatistics();
  }, [metadata]);

  return (
    <tr>
      <td>{metadata.description || metadata.id}</td>
      <td>{metadata.status}</td>
      <td>{stats?.tileCount?.toLocaleString()}</td>
      <td>{stats && convertBytesToReadableString(stats.sizeInBytes)}</td>
      <td>
        <IconButton color={'primary'} onClick={handleEditCacheDescription}>
          <Edit />
        </IconButton>
        <IconButton color={'error'} onClick={handleDelete}>
          <Delete />
        </IconButton>
      </td>
    </tr>
  );
};

export default TileCacheListRow;
