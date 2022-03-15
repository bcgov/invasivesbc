import { RecordSetContext } from 'contexts/recordSetContext';
import React, { useContext, useState, useEffect, useMemo } from 'react';
import RecordSet from './RecordSet';

// https://stackoverflow.com/a/60325899
export const RecordSetRenderer = (props) => {
  const cntxt = useContext(RecordSetContext);

  const RecordSetMemo = React.memo((props: any) => (
    <RecordSet key={props.key} canRemove={props.canRemove} setName={props.setName} />
  ));
  // do database fetching here, before RecordSetContext.value.map, & useCallback

  const [sets, setSets] = useState(null);

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
        {sets ? (
          //Object.keys(sets).map((recordSetName, index) => {
          sets.map((recordSetName, index) => {
            console.log(['1', '2'].includes(recordSetName));
            return (
              <RecordSet
                key={recordSetName}
                canRemove={['1', '2'].includes(recordSetName) ? false : true}
                setName={recordSetName}
              />
            );
          })
        ) : (
          <></>
        )}
      </>
    );
    //}, [JSON.stringify(cntxt.recordSetState)]);
  }, [sets]);
};
