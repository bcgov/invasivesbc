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
      console.log('TRUE');
      setSets(Object.keys(cntxt.recordSetState).sort());
    }
    console.dir(sets);
  }, [cntxt.recordSetState]);

  return useMemo(() => {
    return (
      <>
        {sets.map((recordSetName, index) => {
          return (
            <RecordSet
              key={recordSetName}
              canRemove={['1', '2'].includes(recordSetName) ? false : true}
              setName={recordSetName}
            />
          );
        })}
      </>
    );
  }, [sets]);
};
