import { getInputWidth, Width } from '../utils';
import './emptySpace.css';

type PropTypes = {
  width?: Width;
};
/**
 * @desc Create blank spaces in form, slotted to same width as other form inputs
 */
const EmptySpace = ({ width = Width.Full }: PropTypes) => <div className={`empty-space ${getInputWidth(width)}`} />;

export default EmptySpace;
