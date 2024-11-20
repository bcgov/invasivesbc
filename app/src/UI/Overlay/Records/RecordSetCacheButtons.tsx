import { RecordSetType, UserRecordCacheStatus, UserRecordSet } from 'interfaces/UserRecordSet';
import { Button, Tooltip } from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import { MouseEvent, useEffect, useState } from 'react';
import RecordCache from 'state/actions/cache/RecordCache';
import { useDispatch, useSelector } from 'utils/use_selector';
import Prompt from 'state/actions/prompts/Prompt';

interface PropTypes {
  recordSet: UserRecordSet;
  setId: string;
}

const RecordSetCacheButtons = ({ recordSet, setId }: PropTypes) => {
  const dispatch = useDispatch();
  const connected = useSelector((state) => state.Network.connected);
  const [cacheActionEnabled, setCacheActionEnabled] = useState<boolean>(false);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    switch (recordSet.cacheMetadata.status) {
      case UserRecordCacheStatus.NOT_CACHED:
        downloadCache();
        break;
      case UserRecordCacheStatus.ERROR:
      case UserRecordCacheStatus.CACHED:
        deleteCache();
        break;
    }
  };
  const downloadCache = () => {
    const callback = (confirmation: boolean) => {
      if (confirmation) {
        dispatch(RecordCache.requestCaching({ setId }));
      }
    };
    dispatch(
      Prompt.confirmation({
        title: 'Download Records',
        prompt: 'Would you like to download this cache? The record sets will be available for offline use.',
        callback
      })
    );
  };

  const deleteCache = () => {
    const callback = (confirmation: boolean) => {
      if (confirmation) dispatch(RecordCache.deleteCache({ setId }));
    };
    dispatch(
      Prompt.confirmation({
        title: 'Delete Records',
        prompt: [
          'Do you want to remove these records from your device? They will no longer be accessible offline.',
          'This action will not delete the records from the database.'
        ],
        callback
      })
    );
  };

  /** Modify the existing status key to be more user readable */
  const formatStatusKey = (cacheStatus: UserRecordCacheStatus): string => {
    if (!cacheStatus) {
      return 'Unknown';
    } else if (cacheStatus === UserRecordCacheStatus.NOT_CACHED) {
      return 'Save';
    }
    return cacheStatus.replaceAll('_', ' ');
  };

  useEffect(() => {
    setCacheActionEnabled(
      connected &&
        [UserRecordCacheStatus.CACHED, UserRecordCacheStatus.NOT_CACHED, UserRecordCacheStatus.ERROR].includes(
          recordSet.cacheMetadata?.status
        )
    );
  }, [recordSet.cacheMetadata?.status, connected]);

  if (recordSet.recordSetType !== RecordSetType.Activity) {
    return;
  }
  return (
    <Tooltip classes={{ tooltip: 'toolTip' }} title="Click to save this layer and it's records">
      <span>
        <Button
          disabled={!cacheActionEnabled}
          className="records__set__layer_cache"
          onClick={handleClick}
          variant="outlined"
        >
          {formatStatusKey(recordSet.cacheMetadata?.status)}
          <SaveIcon />
        </Button>
      </span>
    </Tooltip>
  );
};

export { RecordSetCacheButtons };
