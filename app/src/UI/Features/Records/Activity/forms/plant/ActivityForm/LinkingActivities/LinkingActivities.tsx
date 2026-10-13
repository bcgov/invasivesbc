import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import { useSelector } from 'utils/use_selector';
import RecordTable from 'UI/Features/Records/RecordSet/RecordTable/RecordTable';
import IActivityTableRow from 'interfaces/TableRows/IActivityTableRow';

/**
 * @desc Display for Records that LINK TO this record.
 */
const LinkingActivities = () => {
  const TOOLTIP = 'This list shows other activities that have added this record as a linked activity.';

  // TODO: Update Typing when models done
  const linkingActivities = useSelector(
    (state) => state.ActivityPage.formMetadata?.linking_activities
  ) as unknown as Array<IActivityTableRow>;

  if (!linkingActivities || linkingActivities.length === 0) return null;
  return (
    <Fieldset label={'Referenced By'} tooltip={TOOLTIP}>
      <RecordTable type={'Activity'} data={linkingActivities} />
    </Fieldset>
  );
};

export default LinkingActivities;
