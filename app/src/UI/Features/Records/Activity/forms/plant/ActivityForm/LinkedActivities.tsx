import { useFormContext } from 'react-hook-form';
import CreatableSelect from 'UI/Features/Records/Activity/forms/common/CreatableSelect.tsx/CreatableSelect';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import { FormSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';
import { useDispatch, useSelector } from 'utils/use_selector';
import Prompt from 'state/actions/prompts/Prompt';
import Activity from 'state/actions/activity/Activity';
import { isActivityObservation } from 'state/reducers/activity';
import { useEffect, useMemo } from 'react';
import FormActions from 'state/actions/activity/FormActions';
import StyledTable from 'UI/Reusable/StyledTable/StyledTable';
import { useNavigate } from 'react-router';

type LinkedOption = {
  full: string;
  label: string;
};
const LinkedActivities = () => {
  const navigate = useNavigate();
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
          setValue(`linked_activities.${indices}`, payload as LinkedOption);
        }
      }
    })();
  }, [activities]);

  const formattedTreatmentRecords = useMemo(() => {
    return suggestedTreatmentRecords.map((o) => ({
      label: o.label,
      full: o.full
    }));
  }, [suggestedTreatmentRecords]);

  if (isObservationRecord) return; // Don't link observation activities to others
  return (
    <Fieldset label={'Related Records'}>
      <CreatableSelect<FormSchema, LinkedOption>
        name="linked_activities"
        label="Linked Record ID"
        options={formattedTreatmentRecords}
        labelKey="label"
        valueKey="full"
      />

      {activities.length > 0 && (
        <StyledTable>
          <thead>
            <tr>
              <th>ID</th>
              <th>Activity Date</th>
              <th>Created By</th>
              <th>{disabled ? 'Go to Record' : 'Copy Geometry'}</th>
            </tr>
          </thead>
          <tbody>
            {activities.map((a) => (
              <tr key={a.full}>
                {Array.from({ length: 3 }, (_, i) => {
                  const parts = a.label.split(' | ');
                  const text = parts[i] || '';
                  return <td key={i}>{text}</td>;
                })}
                {disabled ? (
                  // Allow traversing to record when readonly, avoid when not to avoid user losing progress from accidental navigation
                  <td>
                    <input
                      type="button"
                      className="control-button"
                      value="Open Record"
                      onClick={() => navigate(`/Records/Activity/${a.full}`)}
                    />
                  </td>
                ) : (
                  <td>
                    <input type="button" className="control-button" value="Copy" onClick={() => handleCopy(a.full)} />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </StyledTable>
      )}
    </Fieldset>
  );
};
export default LinkedActivities;
