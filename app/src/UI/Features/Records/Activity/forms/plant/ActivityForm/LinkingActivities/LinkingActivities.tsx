import StyledTable from 'UI/Reusable/StyledTable/StyledTable';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import { activityColumnsToDisplay } from 'UI/Features/Records/RecordSet/RecordTableHelpers';
import { useSelector } from 'utils/use_selector';
import CustomPopover from 'UI/Reusable/CustomPopover/CustomPopover';
import { useState } from 'react';
import RecordTablePopoverContent from 'UI/Features/Records/RecordSet/RecordTablePopoverContent/RecordTablePopoverContent';
import { RecordSetType } from 'interfaces/UserRecordSet';

/**
 * @desc Display for Records that LINK TO this record.
 */
const LinkingActivities = () => {
  const TOOLTIP = 'This list shows other activities that have added this record as a linked activity.';
  const handleClick = (evt, a) => {
    setRecordId(a.activity_id ?? '');
    setDisplayId(a.short_id ?? '');
    setAnchorEl(evt.currentTarget);
  };
  const linkingActivities = useSelector((state) => state.ActivityPage.formState?.linking_activities);

  const [recordId, setRecordId] = useState<string>('');
  const [displayId, setDisplayId] = useState<string>('');
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  if (!linkingActivities || linkingActivities.length === 0) {
    return null;
  }
  return (
    <Fieldset label={'Related Records'} tooltip={TOOLTIP}>
      <CustomPopover buttonOverrideOptions={{ anchorEl, setAnchorEl }}>
        <RecordTablePopoverContent
          recordDisplayId={displayId}
          recordLookupId={recordId}
          recordType={RecordSetType.Activity}
        />
      </CustomPopover>
      <StyledTable>
        <thead>
          <tr>
            {activityColumnsToDisplay.map((c) => (
              <th>{c.name}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linkingActivities.map((a) => (
            <tr key={a?.activity_id as string}>
              {activityColumnsToDisplay.map((c) => (
                <td onClick={(evt) => handleClick(evt, a)} key={c.key}>
                  {(a?.[c.key] as string | number) || <span className="null-value" aria-hidden={true} />}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </Fieldset>
  );
};

export default LinkingActivities;
