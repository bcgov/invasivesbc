import { getInputWidth, Width } from 'UI/Features/Records/Activity/forms/common/utils';
import './formSpacer.css';

type PropTypes = {
  width?: Width;
};
/**
 * @desc Create blank spaces in form, slotted to same width as other form inputs
 */
const FormSpacer = ({ width = Width.Full }: PropTypes) => <div className={`empty-space ${getInputWidth(width)}`} />;

export default FormSpacer;
