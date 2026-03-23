import { useFormContext } from 'react-hook-form';
import { FormSchema } from '../interfaces';
import CustomPopover from 'UI/Reusable/CustomPopover/CustomPopover';
import { Error } from '@mui/icons-material';
import { MouseEvent, TouchEvent, useState } from 'react';
import FormActions from 'state/actions/activity/FormActions';
import { useDispatch, useSelector } from 'utils/use_selector';
import Prompt from 'state/actions/prompts/Prompt';
import getDefaultFormState from '../builders/getDefaultState';

/**
 * @desc Popover menu for form controls, handle Submit/Draft/Duplication fields.
 */
const FormControl = () => {
  const handleOpenMenu = (evt: MouseEvent<HTMLElement> | TouchEvent<HTMLElement>) => {
    setAnchorEl(evt.currentTarget);
  };

  const handleClear = () => {
    dispatch(
      Prompt.confirmation({
        prompt: 'Do you want to clear your form? You will lose all progress.',
        title: 'Clear Form',
        confirmText: 'Clear form',
        callback: (confirmation: boolean) => {
          if (confirmation) {
            dispatch(FormActions.clearFormState());
            reset(getDefaultFormState(subtype));
          }
        }
      })
    );
  };

  const handleDuplicateForm = () => {
    dispatch(FormActions.startDuplicateForm());
  };

  const saveToDraft = () => {
    if (!isDirty) return;
    dispatch(FormActions.sendForm({ data: getValues(), type: 'draft' }));
  };

  const {
    getValues,
    reset,
    formState: { disabled, isDirty, errors }
  } = useFormContext<FormSchema>();

  const dispatch = useDispatch();
  const subtype = useSelector((state) => state.ActivityPage.formType);
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <>
      <input type="button" className="form-popover-anchor" value="Save Menu" onClick={handleOpenMenu} />

      <CustomPopover buttonOverrideOptions={{ anchorEl, setAnchorEl }}>
        <div id="form-popover-menu">
          {!isDirty && (
            <div className="error-warning">
              <p>No Changes Detected</p>
            </div>
          )}
          {Object.keys(errors).length > 0 && (
            <div className="error-warning">
              <Error color="error" />
              <p>Error(s) in form: ({Object.keys(errors).length})</p>
            </div>
          )}
          <input
            // Type="Submit" is tied to react-hook-form, it will handle the submission logic.
            // Errors don't need to be accounted for in disabling, since the rhf will pan to the error
            className="control-button"
            disabled={disabled || !isDirty}
            form="activity-form"
            type="submit"
            value="Submit Form"
          />
          <input
            className="control-button"
            disabled={disabled || !isDirty}
            onClick={saveToDraft}
            type="button"
            value="Save to Drafts"
          />
          <input
            className="control-button"
            disabled={disabled}
            onClick={handleClear}
            type="button"
            value="Clear Form"
          />
          <input type="button" className="control-button" onClick={handleDuplicateForm} value="Duplicate Form" />
        </div>
      </CustomPopover>
    </>
  );
};

export default FormControl;
