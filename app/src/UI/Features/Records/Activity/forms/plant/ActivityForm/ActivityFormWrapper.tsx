import { useParams } from 'react-router';
import ActivityForm from './ActivityForm';
import { useSelector } from 'utils/use_selector';

/**
 * @desc Lightweight wrapper for resetting local state when forms change without a rerender
 *       e.g. direct navigation via map popover
 */
const ActivityFormWrapper = () => {
  const { id } = useParams();
  const formId = useSelector((state) => state.ActivityPage?.formId ?? '');
  return <ActivityForm key={id + formId} />;
};
export default ActivityFormWrapper;
