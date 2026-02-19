import { useFormContext } from 'react-hook-form';
import CreatableSelect from '../../common/CreatableSelect.tsx/CreatableSelect';
import Fieldset from '../../common/Fieldset/Fieldset';
import { FormSchema } from '../interfaces';
import { useSelector } from 'utils/use_selector';
import { useDispatch } from 'react-redux';
import Prompt from 'state/actions/prompts/Prompt';
import Activity from 'state/actions/activity/Activity';

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

  const suggestedTreatmentIDs = useSelector((state) => state.ActivityPage.suggestedTreatmentIDs);
  const dispatch = useDispatch();
  const { watch } = useFormContext<FormSchema>();
  const activities = watch('linked_activities');

  return (
    <Fieldset label={'Related Records'}>
      <CreatableSelect<FormSchema, { short_id: string; full: string }>
        name="linked_activities"
        label="Linked Record ID"
        options={suggestedTreatmentIDs.map(({ label, value }) => ({ short_id: label, full: value }))}
        labelKey="short_id"
        valueKey="full"
      />

      <ul className="linked-activity-entry">
        {activities?.map((act) => (
          <li key={act.full}>
            <span>{act.short_id}</span>{' '}
            <input
              className="control-button"
              type="button"
              value="Copy Geometry"
              onClick={() => handleCopy(act.full)}
            />
          </li>
        ))}
      </ul>
    </Fieldset>
  );
};
export default LinkedActivities;
