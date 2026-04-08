import { useEffect, useMemo } from 'react';
import { ActivitySubtypesRelations, ActivitySubtypes, ActivitySubtypesShortLabels } from 'sharedAPI';
import 'UI/Features/Records/NewRecordDialog.css';
import { useDispatch, useSelector } from 'utils/use_selector';
import UserSettings from 'state/actions/userSettings/UserSettings';
import { useNavigate } from 'react-router';
import FormActions from 'state/actions/activity/FormActions';
import StyledModal from 'UI/Reusable/StyledModal/StyledModal';
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form';
import SingleSelect from './Activity/forms/common/SingleSelect/SingleSelect';
import FormCode from 'interfaces/FormCode';

interface NewRecordForm {
  category: string;
  type: string;
  subtype: ActivitySubtypes;
}

const NewRecordDialog = () => {
  const handleClose = () => dispatch(UserSettings.closeNewRecordDialogue());

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const open = useSelector((state) => state.UserSettings.newRecordDialogueState.open);
  const mode = useSelector((state) => state.UserSettings.newRecordDialogueState.viewLayout);

  const methods = useForm<NewRecordForm>({
    mode: 'onChange',
    defaultValues: {
      category: undefined,
      type: undefined,
      subtype: undefined
    }
  });

  const { watch, handleSubmit, resetField } = methods;
  const category = watch('category');
  const type = watch('type');
  const subtype = watch('subtype');

  const categoryOptions: Array<FormCode> = useMemo(() => {
    // TODO: Add Permission Logic to options
    return [{ code: 'Plant', full_name: 'Plant Record' }];
  }, []);

  const typeOptions: Array<FormCode> = useMemo(() => {
    if (!category) return [];
    return Object.keys(ActivitySubtypesRelations?.[category])?.map((key) => ({
      code: key,
      full_name: key
    }));
  }, [category]);

  const subtypeOptions: Array<FormCode> = useMemo(() => {
    if (!type) return [];
    return ActivitySubtypesRelations[category][type].map((code: string) => ({
      code: code,
      full_name: ActivitySubtypesShortLabels[code] ?? code
    }));
  }, [type, category]);

  const onSubmit: SubmitHandler<NewRecordForm> = (data) => {
    if (mode === 'new') {
      dispatch(FormActions.createNewForm(data.subtype));
    } else {
      dispatch(FormActions.duplicateForm({ subtype: data.subtype }));
    }
    navigate('/Records/HookForm/new/form');
  };

  useEffect(() => {
    // Reset user selections if option no longer available.
    if (typeOptions.every(({ code }) => code !== type)) resetField('type');
    if (subtypeOptions.every(({ code }) => code !== subtype)) resetField('subtype');
  }, [subtypeOptions, typeOptions]);
  return (
    <StyledModal open={!!open} onClose={handleClose} id="new-record-dialog-content">
      <div className="header">Create {mode} Record</div>
      <div className="content">
        {mode === 'duplicate' && <p>Select activity subtype you want to copy data into</p>}
        <FormProvider {...methods}>
          <form autoComplete="off" id="create-record-form" onSubmit={handleSubmit(onSubmit)}>
            <SingleSelect
              name={'category'}
              label={'Record Category'}
              rules={{ required: true }}
              required
              options={categoryOptions}
            />
            <SingleSelect
              name={'type'}
              label={'Record Type'}
              required
              rules={{ required: true }}
              options={typeOptions}
            />
            <SingleSelect
              name={'subtype'}
              label={'Record Sub-Type'}
              required
              rules={{ required: true }}
              options={subtypeOptions}
            />
          </form>
        </FormProvider>
      </div>
      <div className="control">
        <input type="button" value="Cancel" onClick={handleClose} />
        <input type="submit" form="create-record-form" value={`${mode} Record`} />
      </div>
    </StyledModal>
  );
};

export default NewRecordDialog;
