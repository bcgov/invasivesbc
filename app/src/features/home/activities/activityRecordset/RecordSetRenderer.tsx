import { Box } from '@mui/material';
import React, { useContext, useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { selectUserSettings } from 'state/reducers/userSettings';
import RecordSet from './RecordSet';

// https://stackoverflow.com/a/60325899
export const RecordSetRenderer = (props) => {
  const userSettings = useSelector(selectUserSettings);

  // do database fetching here, before RecordSetContext.value.map, & useCallback

  const [sets, setSets] = useState([]);

  useEffect(() => {
    if (userSettings.recordSets) {
      setSets((prev) => {
        let keys = Object.keys(userSettings.recordSets);
        keys = keys.sort((a, b) => {
          return Number(a) - Number(b);
        });
        return keys;
      });
    }
  }, [userSettings.recordSets]);

  return useMemo(() => {
    return (
      <Box style={{ paddingBottom: '50px' }}>
        {sets.map((recordSetName, index) => {
          return (
            <RecordSet
              key={recordSetName + index + 'Record Set'}
              canRemove={['1', '3', '2'].includes(recordSetName) ? false : true}
              setName={recordSetName}
            />
          );
        })}
      </Box>
    );
  }, [sets]);
};
