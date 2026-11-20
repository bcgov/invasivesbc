import { Controller, get, SubmitHandler, useFormContext } from 'react-hook-form';
import { useNavigate } from 'react-router';

import TextArea from '../Records/Activity/forms/common/TextArea/TextArea';
import greaterThanEqual from '../Records/Activity/forms/common/validators/greaterThanEqual';
import { Width } from '../Records/Activity/forms/common/utils';
import CheckboxUI from '../Records/Activity/forms/common/CheckboxUI/CheckboxUI';
import './reportBugPage.css';
// import { chooseMediaFromLibrary, takePhotoFromCamera, transformImageToFormData } from 'utils/fileUpload';
// import UploadedPhoto from 'interfaces/UploadedPhoto';
// import Image from 'UI/Reusable/Image/Image';
import Button from 'UI/Reusable/Button/Button';
import { MobileOnly } from 'UI/Reusable/Predicates/MobileOnly';
import { CreateBugReportInSchema, PlatformSource } from 'api/api-schema';
import useReportBugPage from './reportBugPage.hooks';
import { PLATFORM_SRC } from 'constants/misc';
import { useDispatch, useSelector } from 'utils/use_selector';
import SingleSelect from '../Records/Activity/forms/common/SingleSelect/SingleSelect';
import { GenericSingleSelect } from 'UI/Reusable/GenericSingleSelect/GenericSingleSelect';
import ErrorMessage from '../Records/Activity/forms/common/ErrorMessage/ErrorMessage';
import TextInput from 'UI/Features/Records/Activity/forms/common/TextInput/TextInput';
import Alerts from 'state/actions/alerts/Alerts';
import { alertMessages } from './reportBugPage.consts';

// TODO - Add ability to upload screenshots/videos
const ReportBugForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const [files, setFiles] = useState<UploadedPhoto[]>([]);
  const bugIssueTypeCodes = useSelector((state) => state.ActivityPage?.formCodes?.BugReportTypeCode);
  const {
    control,
    getValues,
    handleSubmit,
    register,
    formState: { errors }
  } = useFormContext<CreateBugReportInSchema>();

  const atLeastOne = () => getValues('online') || getValues('offline') || 'Select online or offline';

  // const handleTakePhotoFromCamera = async () => {
  //   const result = await takePhotoFromCamera();
  //   if (result) {
  //     const transformedImage = transformImageToFormData(result);
  //     setFiles((prev) => [...prev, transformedImage]);
  //   }
  // };

  // const handleChooseMediaFromLibrary = async () => {
  //   const results = await chooseMediaFromLibrary();
  //   if (results && results.length > 0) {
  //     // filter out failed photo conversions
  //     const successfulPhotos = results.filter(Boolean);
  //     setFiles((prev) => [...prev, ...successfulPhotos]);
  //   }
  // };

  const { createBugReport } = useReportBugPage();

  const onSubmit: SubmitHandler<CreateBugReportInSchema> = async (data) => {
    const platformSrc = (PLATFORM_SRC as string).charAt(0).toUpperCase() + (PLATFORM_SRC as string).slice(1);

    try {
      const res = await createBugReport({
        ...data,
        device: platformSrc as PlatformSource,
        online: platformSrc === 'Web' ? true : data.online
      });
      if (res?.ok) {
        await res.json();
        navigate(`/`);
        dispatch(Alerts.create(alertMessages.success));
      } else {
        dispatch(Alerts.create(alertMessages.fail));
      }
    } catch {
      dispatch(Alerts.create(alertMessages.fail));
    }
  };

  // const handleDeleteMedia = (encoded_file: string) =>
  //   setFiles((prev) => prev.filter((f) => f.encoded_file !== encoded_file));

  return (
    <form id="report-bug-form" onSubmit={handleSubmit(onSubmit)}>
      <TextInput
        error={get(errors, `title`)}
        id={`title`}
        label={'Title'}
        required
        width={Width.Full}
        {...register('title', {
          required: true,
          validate: (val) => greaterThanEqual(val, 5)
        })}
      />
      <TextArea
        label={'Description/Steps You Took'}
        id="description"
        error={get(errors, 'description')}
        required
        width={Width.Full}
        {...register('description', {
          required: true,
          validate: (val) => greaterThanEqual(val, 5)
        })}
      />
      <TextArea label={'Expected behavior'} id="expected_behavior" width={Width.Full} />
      <GenericSingleSelect
        label={'Can you reproduce it?'}
        options={[
          { label: 'Yes', value: 'Yes' },
          { label: 'No', value: 'No' }
        ]}
        rules={{ required: true }}
        width={Width.Half}
        name={'reproducible'}
        required
      />
      <MobileOnly>
        <div className="checkbox-question-container">
          <p className="checkbox-question-label">Is this happening online or offline (or both)?</p>
          <div className="checkbox-container">
            <Controller
              control={control}
              defaultValue={false}
              name="offline"
              rules={{ validate: atLeastOne, deps: ['online'] }}
              render={({ field: { onChange, value } }) => (
                <CheckboxUI
                  label={'Offline'}
                  required
                  state={value}
                  onChange={() => {
                    onChange(!value);
                  }}
                  width={Width.Quarter}
                />
              )}
            />
            <Controller
              control={control}
              defaultValue={false}
              name="online"
              rules={{ validate: atLeastOne, deps: ['offline'] }}
              render={({ field: { onChange, value } }) => (
                <CheckboxUI
                  label={'Online'}
                  required
                  state={value}
                  onChange={() => {
                    onChange(!value);
                  }}
                  width={Width.Quarter}
                />
              )}
            />
          </div>
          {(errors.online || errors.offline) && <ErrorMessage error={{ type: 'required' }} label="Online or Offline" />}
        </div>
      </MobileOnly>
      <SingleSelect
        label={'Type of issue'}
        options={bugIssueTypeCodes}
        rules={{ required: true }}
        width={Width.Half}
        name={'issue_type'}
        required
      />
      {/* TODO */}
      {/* <div className="media-upload-container">
        <div className="media-upload-options">
          <p>Screenshots</p>
          <input
            type="button"
            className="upload-button"
            disabled={disabled}
            onClick={handleTakePhotoFromCamera}
            value={'Capture Photo'}
          />
          <input
            type="button"
            className="upload-button"
            disabled={disabled}
            onClick={handleChooseMediaFromLibrary}
            value="Choose from Gallery"
          />
        </div>
        <div className="media-wrapper">
          {files?.map((photo) => (
            <Image
              height={100}
              photo={photo}
              key={photo.file_name}
              remove={() => handleDeleteMedia(photo.encoded_file)}
              width={100}
            />
          ))}
        </div>
      </div> */}
      <Button variant="contained" color="primary" size="lg" type="submit">
        Submit Report
      </Button>
    </form>
  );
};

export default ReportBugForm;
