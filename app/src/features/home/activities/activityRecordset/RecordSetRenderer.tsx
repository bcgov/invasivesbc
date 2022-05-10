import { Box } from '@mui/material';
import { RecordSetContext } from 'contexts/recordSetContext';
import React, { useContext, useState, useEffect, useMemo } from 'react';
import RecordSet from './RecordSet';

// https://stackoverflow.com/a/60325899
export const RecordSetRenderer = (props) => {
  const cntxt = useContext(RecordSetContext);

  // do database fetching here, before RecordSetContext.value.map, & useCallback

  const [sets, setSets] = useState([]);

  useEffect(() => {
    if (cntxt.recordSetState) {
      setSets((prev) => {
        let keys = Object.keys(cntxt.recordSetState);
        keys = keys.sort((a, b) => {
          return Number(a) - Number(b);
        });
        return keys;
      });
    }
  }, [cntxt.recordSetState]);

  return useMemo(() => {
    return (
      <Box style={{ paddingBottom: '50px' }}>
        {sets.map((recordSetName, index) => {
          return (
            <RecordSet
              key={recordSetName}
              canRemove={['1', '2'].includes(recordSetName) ? false : true}
              setName={recordSetName}
            />
          );
        })}
      </Box>
    );
  }, [sets]);
};
