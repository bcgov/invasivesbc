import { useFormContext } from 'react-hook-form';
import CreatableSelect from 'UI/Features/Records/Activity/forms/common/CreatableSelect.tsx/CreatableSelect';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import { FormSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import { useDispatch, useSelector } from 'utils/use_selector';
import Prompt from 'state/actions/prompts/Prompt';
import Activity from 'state/actions/activity/Activity';
import { isActivityObservation } from 'state/reducers/activity';
import { useEffect } from 'react';
import FormActions from 'state/actions/activity/FormActions';

const LinkedActivities = () => {
  const handleCopy = (id: string | number) =>
    dispatch(
      Prompt.confirmation({
        title: 'Copy shape',
        prompt:
          'Do you want to replace your current shape with this one? Your existing shape will be lost if you continue.',
        confirmText: 'Copy shape',
        callback: (confirm: boolean) => {
          if (confirm) {
            dispatch(Activity.Autofill.copyGeometry(id.toString()));
          }
        }
      })
    );

  const suggestedTreatmentRecords = useSelector((state) => state.ActivityPage.suggestions.recordsInArea);
  const isObservationRecord = useSelector(isActivityObservation);
  const dispatch = useDispatch();
  const {
    watch,
    setValue,
    formState: { disabled }
  } = useFormContext<FormSchema>();
  const activities = watch('linked_activities');

  useEffect(() => {
    // Check manually entered Short ID's for Existence and update the 'full' value to the records ID
    (async () => {
      if (!activities) return;
      const indicesToProcess = activities
        ?.map((act, idx) => (act.full === act.label ? idx : -1))
        .filter((idx) => idx !== -1);
      for (const indices of indicesToProcess) {
        const { label } = activities[indices];
        const { payload } = await dispatch(FormActions.validateManualLinkedId({ id: label }));
        if (!payload) {
          const updatedActivities = structuredClone(activities);
          updatedActivities.splice(indices, 1);
          setValue('linked_activities', updatedActivities);
        } else {
          setValue(`linked_activities.${indices}.full`, payload);
        }
      }
    })();
  }, [activities]);

  if (isObservationRecord) return; // Don't link observation activities to others
  return (
    <Fieldset label={'Related Records'}>
      <CreatableSelect<FormSchema, { label: string; full: string }>
        name="linked_activities"
        label="Linked Record ID"
        options={suggestedTreatmentRecords}
        labelKey="label"
        valueKey="full"
      />

      <ul className="linked-activity-entry">
        {activities?.map((act) => (
          <li key={act.full}>
            <span>{act.label}</span>
            {act.label !== act.full && (
              <input
                disabled={disabled}
                className="control-button"
                type="button"
                value="Copy Geometry"
                onClick={() => handleCopy(act.full)}
              />
            )}
          </li>
        ))}
      </ul>
    </Fieldset>
  );
};
export default LinkedActivities;
