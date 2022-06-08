import { ActivityStatus } from 'constants/activities';
import { useDataAccess } from 'hooks/useDataAccess';
import React, { useState, useEffect, useContext } from 'react';
import { AuthStateContext } from './authStateContext';

// Where state is managed for all the sets of records, updates localstorage as it happens.
// Everything that uses this context needs a memo that adequately checks dependencies, and none of them
// should call useState setters in their parents. Thats where the render loops are coming from in the Layer Picker etc.
export const RecordSetContext = React.createContext(null);
export const RecordSetProvider = (props) => {
  const [recordSetState, setRecordSetState] = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [boundaries, setBoundaries] = useState<Boundary[]>([]);
  const dataAccess = useDataAccess();
  const { userInfo } = useContext(AuthStateContext);

  const getInitialState = async () => {
    const oldState = dataAccess.getAppState();
    if (oldState?.recordSets) {
      setRecordSetState({ ...oldState.recordSets });
    } else {
      const defaults = {
        recordSets: {
          ['1']: {
            recordSetType: 'Activity',
            recordSetName: 'My Drafts',
            advancedFilters: [
              {
                filterField: 'created_by',
                filterValue: userInfo?.preferred_username,
                filterKey: 'created_by' + userInfo?.preferred_username
              },
              {
                filterField: 'record_status',
                filterValue: ActivityStatus.DRAFT,
                filterKey: 'record_status' + ActivityStatus.DRAFT
              }
            ]
          },
          ['2']: {
            recordSetType: "Activity",
            recordSetName: 'All InvasivesBC Activities',
            advancedFilters: []
          },
          ['3']: {
            recordSetType: "POI",
            recordSetName: 'All IAPP Records',
            advancedFilters: []
          }
        }
      };

      dataAccess.setAppState({ ...defaults });
      setRecordSetState({ ...defaults.recordSets });
    }
  };

  const add = (type: string) => {
    setRecordSetState((prev) => ({
      ...prev,
      [JSON.stringify(Object.keys(prev).length + 1)]: {
        recordSetType: type,
        recordSetName: 'New Record Set',
        advancedFilters: [],
        gridFilters: {},
        drawOrder: Object.keys(prev).length + 1
      }
    }));
  };

  const remove = (recordSetName: string) => {
    setRecordSetState((prev) => {
      let newRecordSetState = {};

      Object.keys(prev).forEach((key) => {
        if (key !== recordSetName) {
          newRecordSetState[key] = prev[key];
        }
      });

      return newRecordSetState;
    });
  };

  const addBoundaryToSet = async (boundary: Boundary, setName: string) => {
    const oldState = dataAccess.getAppState();
    const recordSets = oldState?.recordSets;
    const currentSet = recordSets[setName];

    // add search boundary to given record set if doesn't exist
    // if (currentSet.searchBoundary) {
    //   if (!currentSet.searchBoundary.includes(boundary)) {
    //     currentSet.searchBoundary = [...currentSet.searchBoundary, boundary];
    //   }
    // } else {
    //   // create if not exists
    //   currentSet.searchBoundary = [boundary];
    // }

    // seems like only one geometry can be intersected at one time
    currentSet.searchBoundary = boundary;

    setRecordSetState({ ...recordSets });
    // dataAccess.setAppState({ recordSets: { ...recordSets } });
  }

  useEffect(() => {
    getInitialState();
  }, []);

  const updateState = async () => {
    const oldState = dataAccess.getAppState();
    const oldRecordSets = oldState?.recordSets;
    if (
      oldRecordSets &&
      recordSetState &&
      (JSON.stringify(oldRecordSets) !== JSON.stringify(recordSetState) ||
        (oldState?.activeActivity !== selectedRecord?.id && oldState?.activeIappSite !== selectedRecord?.id))
    ) {
      if (selectedRecord?.id) {
        if (selectedRecord?.isIAPP) {
          dataAccess.setAppState({ recordSets: { ...recordSetState }, activeIappSite: selectedRecord.id });
        } else {
          dataAccess.setAppState({ recordSets: { ...recordSetState }, activeActivity: selectedRecord.id });
        }
      } else {
        dataAccess.setAppState({ recordSets: { ...recordSetState } });
      }
    }
  };

  useEffect(() => {
    updateState();
  }, [JSON.stringify(recordSetState), JSON.stringify(selectedRecord)]);

  if (recordSetState !== null) {
    return (
      <RecordSetContext.Provider
        value={{
          setSelectedRecord: setSelectedRecord,
          selectedRecord: selectedRecord,
          recordSetState: recordSetState,
          setRecordSetState: setRecordSetState,
          add: add,
          remove: remove,
          boundaries: boundaries,
          setBoundaries: setBoundaries,
          addBoundaryToSet: addBoundaryToSet
        }}>
        {props.children}
      </RecordSetContext.Provider>
    );
  } else return <></>;
};
