import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import { useSelector } from 'utils/use_selector';
import RecordTable from 'UI/Features/Records/RecordSet/RecordTable/RecordTable';
import { ActivityPlantRowOut } from 'api/api-schema';

/**
 * @desc Display for Records that LINK TO this record.
 */
const LinkingActivities = () => {
  const TOOLTIP = 'This list shows other activities that have added this record as a linked activity.';

  const linkingActivities = useSelector(
    (state) => state.ActivityPage.formMetadata?.linking_activities
  ) as Array<ActivityPlantRowOut>;

  if (!linkingActivities || linkingActivities.length === 0) return null;
  return (
    <Fieldset label={'Referenced By'} tooltip={TOOLTIP}>
      <RecordTable type={'Activity'} data={linkingActivities} />
    </Fieldset>
  );
};

export default LinkingActivities;
