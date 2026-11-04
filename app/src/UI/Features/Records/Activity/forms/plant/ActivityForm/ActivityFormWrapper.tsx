import { useLocation } from 'react-router';
import ActivityForm from './ActivityForm';

/**
 * @desc Lightweight wrapper for resetting local state when forms change without a rerender
 *       e.g. direct navigation via map popover
 */
const ActivityFormWrapper = () => {
  const { key } = useLocation(); // Updates even if route is the same (e.g. /new -> /new)
  return <ActivityForm key={key} />;
};
export default ActivityFormWrapper;
