import './changeHistory.css';
import { useSelector } from 'utils/use_selector';
import { ReactNode, useState } from 'react';
import { ArrowForward } from '@mui/icons-material';
import StyledModal from 'UI/Reusable/StyledModal/StyledModal';
import Button from 'UI/Reusable/Button/Button';

enum ChangeType {
  ItemAdded = 'iterable_item_added',
  ItemRemoved = 'iterable_item_removed',
  ValueChanged = 'values_changed',
  TypeChanges = 'type_changes'
}

/**
 * @property {string} activity Record Identifier (UUID format)
 * @property {string} date Date of change
 * @property {string} platform - Platform change was initiated from e.g.: Batch, Web, iOS, Android
 * @property {string} user - Readable name of User who initiated the record change.
 * @property {number} version - Version of change created. e.g.: 1, 2, 3
 */
type History = {
  activity: string;
  date: string;
  diff: Record<ChangeType, Record<PropertyKey, unknown>>;
  platform: string;
  user: string;
  version: string;
};

/**
 * @desc Format Diff Labels to a smaller readable format, skips indices
 * @param { string } l supplied diff, e.g.: root['subtype_data']['context']['pest_management_plan']
 * @returns { string } formatted string, e.g.: "pest management plan"
 */
const formatLabel = (l: string): string => {
  const partial = l.match(/'([^']+)'(?=[^']*$)/);
  if (!partial) return l;
  return partial[1].replace(/_/g, ' ');
};
const parseObject = (entry: unknown) => {
  // Explicit to not block 'False' from boolean switches
  if (entry == null || entry == undefined) return '';
  if (typeof entry === 'object' && entry !== null) {
    const keys = Object.keys(entry);
    const isMultiKey = keys.length > 1;
    if (isMultiKey && 'full' in entry && 'label' in entry) {
      // Edge case for Linked Id's
      return (entry.label as string).split(' | ')[0];
    } else if (isMultiKey) {
      return JSON.stringify(entry, null, 2);
    } else {
      return entry[keys[0]].toString();
    }
  }
  return entry.toString();
};

/**
 * Format incoming values
 * @param vc Values Changed -- DeepDiff object values_changed key. contains a { PropertyKey: { old_value, new_value }}
 * @returns {ReactNode} Formatted Input element for comparing before and after. e.g.: "Old -> New"
 */
const _formattedValuesChanges = (vc: Record<PropertyKey, any> = {}): Array<ReactNode> => {
  const entries: Array<ReactNode> = Object.entries(vc).map(([key, v]) => {
    const MAX_SIZE_BEFORE_HIDDEN = 400;

    const { old_value, new_value } = v;
    const previous = parseObject(old_value);
    const current = parseObject(new_value);

    const IS_LARGE_DIFF = previous.length + current.length > MAX_SIZE_BEFORE_HIDDEN;
    const [showDiff, setShowDiff] = useState<boolean>(!IS_LARGE_DIFF);

    return (
      <li className="diff-entry">
        <dt className="label">{formatLabel(key)}</dt>
        <dd className="italic">Value Modified</dd>
        {IS_LARGE_DIFF && (
          <dd>
            <Button onClick={() => setShowDiff((prev) => !prev)}>See Change</Button>
          </dd>
        )}
        {showDiff && (
          <dd>
            <del className="deep-red">{previous}</del>
            &nbsp;
            <ArrowForward />
            &nbsp;
            <ins className="green">{current}</ins>
          </dd>
        )}
      </li>
    );
  });
  return entries;
};

/**
 * Format incoming values.
 * The only time items should change type in the forms is when they go from Something to Null or vice-versa, so these are treated as additions/subtractions
 * @param vc Values Changed -- DeepDiff object type_changes key. contains a { PropertyKey: { olt_type, old_value, new_type, new_value }}
 * @returns {ReactNode} Formatted Input element for comparing before and after. e.g.: "Old -> New"
 */
const _formattedTypeChanges = (va: Record<PropertyKey, any> = {}): Array<ReactNode> => {
  const additions = {};
  const removals = {};
  Object.entries(va).forEach(([key, value]) => {
    if (value?.new_type === 'NoneType') {
      removals[key] = value.old_value;
    } else if (value?.old_type === 'NoneType') {
      additions[key] = value.new_value;
    }
  });
  return [..._formattedValuesAdded(additions), ..._formattedValuesRemoved(removals)];
};

/**
 *
 * @param va Values Added -- DeepDiff object iterated_values_added key. contains a { PropertyKey: value }
 * @returns {ReactNode} Formatted Input element for comparing before and after. e.g.: "BCGOV"
 */
const _formattedValuesAdded = (va: Record<PropertyKey, any> = {}): Array<ReactNode> => {
  const entries: Array<ReactNode> = Object.entries(va).map(([key, value]) => {
    return (
      <li className="diff-entry">
        <dt>{formatLabel(key)}</dt>
        <dd className="italic">Value Added</dd>
        <dd className="green">
          <ins>{parseObject(value)}</ins>
        </dd>
      </li>
    );
  });

  return entries;
};

/**
 *
 * @param vr Values Removed -- DeepDiff object iterated_values_removed key. contains a { PropertyKey: value }
 * @returns {ReactNode} Formatted Input element for comparing before and after. e.g.: "-BCGOV-"
 */
const _formattedValuesRemoved = (vr: Record<PropertyKey, any> = {}): Array<ReactNode> => {
  const entries: Array<ReactNode> = Object.entries(vr).map(([key, value]) => {
    return (
      <li className="diff-entry">
        <dt>{formatLabel(key)}</dt>
        <dd className="italic">Value Removed</dd>
        <dd className="deep-red">
          <del>{parseObject(value)}</del>
        </dd>
      </li>
    );
  });

  return entries;
};

/**
 * @desc Subcomponent for rendering a list of individual diffs in a history object.
 */
const AllChanges = ({ diff }) => {
  const entries: Array<ReactNode> = [
    ..._formattedValuesChanges(diff?.[ChangeType.ValueChanged]),
    ..._formattedValuesAdded(diff?.[ChangeType.ItemAdded]),
    ..._formattedTypeChanges(diff?.[ChangeType.TypeChanges]),
    ..._formattedValuesRemoved(diff?.[ChangeType.ItemRemoved])
  ];
  return (
    <>
      <dt>Changes</dt>
      <dd>
        <ul className="changes">{entries.map((r) => r)}</ul>
      </dd>
    </>
  );
};

const ChangeHistory = () => {
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const history = useSelector((state) => state.ActivityPage.formMetadata?.history) as Array<History>;
  return (
    <>
      <Button onClick={() => setIsModalOpen(true)} disabled={!history?.length}>
        {history?.length ?? 0} Revisions
      </Button>
      <StyledModal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <div className="header">Revision History</div>
        <div className="content">
          <div className="history-wrapper">
            {history && history.length > 0 && (
              <ul id="activity-history">
                {history.map((h) => (
                  <li className="entry" key={h.version}>
                    <dl className="details">
                      <dt>Updated By</dt>
                      <dd>{h.user}</dd>
                      <dt>Date of Change</dt>
                      <dd>{new Date(h.date).toDateString()}</dd>

                      <AllChanges diff={h.diff} />
                    </dl>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
        <div className="control">
          <Button onClick={() => setIsModalOpen((prev) => !prev)}>Close</Button>
        </div>
      </StyledModal>
    </>
  );
};
export default ChangeHistory;
