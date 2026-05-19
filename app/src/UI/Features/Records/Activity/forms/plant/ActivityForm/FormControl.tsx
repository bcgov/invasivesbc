import { useFormContext } from 'react-hook-form';
import { FormSchema } from '../interfaces';
import CustomPopover from 'UI/Reusable/CustomPopover/CustomPopover';
import { Error } from '@mui/icons-material';
import { MouseEvent, TouchEvent, useMemo, useState } from 'react';
import FormActions from 'state/actions/activity/FormActions';
import { useDispatch, useSelector } from 'utils/use_selector';
import Prompt from 'state/actions/prompts/Prompt';
import getDefaultFormState from '../builders/getDefaultState';
import { Role } from 'constants/roles';

/**
 * @desc Popover menu for form controls, handle Submit/Draft/Duplication fields.
 */
const FormControl = () => {
  const handleOpenMenu = (evt: MouseEvent<HTMLElement> | TouchEvent<HTMLElement>) => {
    setAnchorEl(evt.currentTarget);
  };

  const handleDelete = () => {
    dispatch(
      Prompt.confirmation({
        prompt: 'Are you sure you want to delete your record?',
        title: 'Delete Form?',
        confirmText: 'Delete this record',
        callback: (confirmation: boolean) => {
          if (confirmation) {
            dispatch(FormActions.delete());
          }
        }
      })
    );
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

  const saveToDraft = async () => {
    if (MOBILE) {
      dispatch(FormActions.saveMobileForm({ data: getValues(), type: 'draft' }));
    } else {
      const values = await dispatch(FormActions.sendForm({ data: getValues(), type: 'draft' }));
      if (FormActions.sendForm.fulfilled.match(values)) {
        setValue('id', values.payload.id);
        setValue('short_id', values.payload.short_id);
      }
    }
  };

  const {
    getValues,
    setValue,
    reset,
    formState: { disabled, errors }
  } = useFormContext<FormSchema>();

  const dispatch = useDispatch();

  const MOBILE = useSelector((state) => state.Configuration.current.build.MOBILE);
  const USERNAME = useSelector((state) => state.Auth.username);
  const ROLES = useSelector((state) => state.Auth.roles);

  const created_by = useSelector((state) => state.ActivityPage?.formState?.created_by);
  const subtype = useSelector((state) => state.ActivityPage.formType);
  const isFormSubmitted = useSelector((state) => state.ActivityPage.formState?.form_status === 'Submitted');

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const isRecordCreator: boolean = useMemo(() => {
    return USERNAME === created_by;
  }, [USERNAME, created_by]);

  const canUserDelete: boolean = useMemo(() => {
    const isAdministrator = ROLES.some((r) => r.role_name === Role.MASTER_ADMINISTRATOR);
    return isRecordCreator || isAdministrator;
  }, [ROLES, isRecordCreator]);

  return (
    <>
      <input type="button" className="form-popover-anchor" value="Save Menu" onClick={handleOpenMenu} />

      <CustomPopover closeAfterPress buttonOverrideOptions={{ anchorEl, setAnchorEl }}>
        <div id="form-popover-menu">
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
            disabled={disabled}
            form="activity-form"
            type="submit"
            value="Submit"
          />
          {!isFormSubmitted && (
            <input
              className="control-button"
              disabled={disabled}
              onClick={saveToDraft}
              type="button"
              value="Save as Draft"
            />
          )}
          <input
            className="control-button"
            disabled={disabled}
            onClick={handleClear}
            type="button"
            value="Clear Form"
          />
          {canUserDelete && (
            <input className="control-button" disabled={disabled} onClick={handleDelete} type="button" value="Delete" />
          )}
          <input type="button" className="control-button" onClick={handleDuplicateForm} value="Duplicate Form" />
        </div>
      </CustomPopover>
    </>
  );
};

export default FormControl;
