import { RecordSetType, UserRecordCacheStatus, UserRecordSet } from 'interfaces/UserRecordSet';
import { Button, IconButton, Tooltip } from '@mui/material';
import EjectIcon from '@mui/icons-material/Eject';
import SaveIcon from '@mui/icons-material/Save';
import { MouseEvent, useEffect, useState } from 'react';
import RecordCache from 'state/actions/cache/RecordCache';
import { useDispatch, useSelector } from 'utils/use_selector';

interface PropTypes {
  recordSet: UserRecordSet;
  setId: string;
}

const RecordSetCacheButtons = ({ recordSet, setId }: PropTypes) => {
  const dispatch = useDispatch();
  const connected = useSelector((state) => state.Network.connected);

  const [deleteEnabled, setDeleteEnabled] = useState<boolean>(false);
  const [saveEnabled, setSaveEnabled] = useState<boolean>(false);

  useEffect(() => {
    setDeleteEnabled(
      [UserRecordCacheStatus.CACHED, UserRecordCacheStatus.ERROR].includes(recordSet.cacheMetadata?.status)
    );
    setSaveEnabled(
      (!recordSet.cacheMetadata || [UserRecordCacheStatus.NOT_CACHED].includes(recordSet.cacheMetadata?.status)) &&
        recordSet.recordSetType == RecordSetType.Activity &&
        connected
    );
  }, [recordSet.cacheMetadata?.status, connected]);

  const onClickInitCache = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    dispatch(RecordCache.requestCaching({ setId }));
  };

  const onClickInitClearCache = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    dispatch(RecordCache.deleteCache({ setId }));
  };

  return (
    <>
      <Tooltip classes={{ tooltip: 'toolTip' }} title="Click to save this layer and it's records">
        <span>
          <Button
            disabled={!saveEnabled}
            className="records__set__layer_cache"
            onClick={(e) => onClickInitCache(e)}
            variant="outlined"
          >
            {recordSet.cacheMetadata?.status ?? 'UNKNOWN'}
            <SaveIcon />
          </Button>
        </span>
      </Tooltip>

      <Tooltip classes={{ tooltip: 'toolTip' }} title="Click to clear cached data for this layer of records">
        <>
          {recordSet.cacheMetadata?.status == UserRecordCacheStatus.DELETING && 'Deleting Cache'}
          <IconButton
            className="records__set__layer_cache"
            disabled={!deleteEnabled}
            onClick={(e) => onClickInitClearCache(e)}
            color="primary"
          >
            <EjectIcon />
          </IconButton>
        </>
      </Tooltip>
    </>
  );
};

export { RecordSetCacheButtons };
