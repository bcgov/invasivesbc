import { MouseEvent } from 'react';
import { useDispatch } from './use_selector';
import { RecordSetId } from 'interfaces/UserRecordSet';
import Activity from 'state/actions/activity/Activity';
import UserSettings from 'state/actions/userSettings/UserSettings';
import Prompt from 'state/actions/prompts/Prompt';

/**
 * @desc Custom Hook for getting Recordset Control actions in one unified location.
 * @param id Recordset identifier
 */
const useRecordSetControls = (id: string) => {
  const dispatch = useDispatch();

  const toggleRecordsetLabel = (e?: MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    if (id === RecordSetId.OfflineActivities) {
      dispatch(Activity.Offline.setLabelVisibility());
    }
    dispatch(UserSettings.RecordSet.toggleLabelVisibility(id));
  };

  const toggleRecordsetLayer = (e?: MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    if (id === RecordSetId.OfflineActivities) {
      dispatch(Activity.Offline.setAllShapeVisibility());
    }
    dispatch(UserSettings.RecordSet.toggleVisibility(id));
  };
  const deleteRecordSet = (e?: MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    const callback = (userConfirmation: boolean) => {
      if (userConfirmation) {
        dispatch(UserSettings.RecordSet.requestRemoval({ setId: id }));
      }
    };
    dispatch(
      Prompt.confirmation({
        title: 'Deleting Record Set',
        prompt: [
          'Are you sure you want to remove this record set?',
          'The data will persist but you will no longer have this set of filters or the map layer.'
        ],
        callback
      })
    );
  };
  const cycleRecordsetColour = (e?: MouseEvent<HTMLButtonElement>) => {
    e?.stopPropagation();
    dispatch(UserSettings.RecordSet.cycleColourById(id));
  };

  return {
    cycleRecordsetColour,
    toggleRecordsetLabel,
    toggleRecordsetLayer,
    deleteRecordSet
  };
};

export { useRecordSetControls };
