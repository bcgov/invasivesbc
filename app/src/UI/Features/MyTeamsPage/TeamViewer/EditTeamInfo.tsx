import { Edit } from '@mui/icons-material';
import { Fragment, useState } from 'react';
import { FormProvider, get, useForm } from 'react-hook-form';
import TextArea from 'UI/Features/Records/Activity/forms/common/TextArea/TextArea';
import TextInput from 'UI/Features/Records/Activity/forms/common/TextInput/TextInput';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import { greaterThanEqual, lessThanEqual } from 'UI/Features/Records/Activity/forms/common/validators';
import Button from 'UI/Reusable/Button/Button';
import './editTeamInfo.css';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import useTeamsManagement from '../subcomponents/useTeamManagement.hooks';
import { UpdateTeamSchema } from 'api/api-schema';

type PropTypes = {
  details: Record<PropertyKey, any>;
  refresh: Function;
};

const EditTeamInfo = ({ details, refresh }: PropTypes) => {
  const submitHandler = async (data: UpdateTeamSchema) => {
    if (!data.description && !data.name) return;
    const res = await updateTeam(details.id, data);
    if (res?.ok) {
      await refresh();
      setActive(false);
    }
  };
  const [active, setActive] = useState<boolean>(false);
  const { updateTeam } = useTeamsManagement();
  const methods = useForm<UpdateTeamSchema>({
    mode: 'all',
    defaultValues: {
      name: details?.name ?? '',
      description: details?.description ?? ''
    }
  });

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = methods;

  return (
    <Fragment>
      <Button variant="none" onClick={() => setActive((prev) => !prev)}>
        <Edit /> Edit Team
      </Button>
      {active && (
        <div className="edit-team">
          <FormProvider {...methods}>
            <form autoComplete="off" onSubmit={handleSubmit(submitHandler)}>
              <Fieldset label={''}>
                <TextInput
                  label={'Team Name'}
                  error={get(errors, 'name')}
                  width={Width.Half}
                  {...register('name', {
                    required: false,
                    validate: {
                      maxLength: (val) => lessThanEqual(val, 64),
                      minLength: (val) => greaterThanEqual(val, 5)
                    }
                  })}
                />
                <TextArea
                  error={get(errors, 'description')}
                  label={'Team Description'}
                  width={Width.Half}
                  {...register('description', {
                    validate: (v) => lessThanEqual(v, 256),
                    required: false
                  })}
                />
              </Fieldset>
              <Button type="submit" variant="contained">
                Update Team
              </Button>
            </form>
          </FormProvider>
        </div>
      )}
    </Fragment>
  );
};

export default EditTeamInfo;
