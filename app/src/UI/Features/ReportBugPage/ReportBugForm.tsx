import { get, SubmitHandler, useFormContext } from 'react-hook-form';
import { useNavigate } from 'react-router';

import './reportBugPage.css';
import { CreateBugReportInSchema, PlatformSource } from 'api/api-schema';
import { PLATFORM_SRC } from 'constants/misc';
import Alerts from 'state/actions/alerts/Alerts';
import { useDispatch, useSelector } from 'utils/use_selector';

import TextArea from 'UI/Features/Records/Activity/forms/common/TextArea/TextArea';
import greaterThanEqual from 'UI/Features//Records/Activity/forms/common/validators/greaterThanEqual';
import { Width } from 'UI/Features//Records/Activity/forms/common/utils';
// import { chooseMediaFromLibrary, takePhotoFromCamera, transformImageToFormData } from 'utils/fileUpload';
// import UploadedPhoto from 'interfaces/UploadedPhoto';
// import Image from 'UI/Reusable/Image/Image';
import Button from 'UI/Reusable/Button/Button';
import { MobileOnly } from 'UI/Reusable/Predicates/MobileOnly';
import useReportBugPage from 'UI/Features/ReportBugPage/reportBugPage.hooks';
import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import { GenericSingleSelect } from 'UI/Reusable/GenericSingleSelect/GenericSingleSelect';
import ErrorMessage from 'UI/Features/Records/Activity/forms/common/ErrorMessage/ErrorMessage';
import TextInput from 'UI/Features/Records/Activity/forms/common/TextInput/TextInput';
import { alertMessages } from 'UI/Features/ReportBugPage/reportBugPage.consts';
import CheckboxInput from 'UI/Features/Records/Activity/forms/common/CheckboxInput/CheckboxInput';

// TODO - Add ability to upload screenshots/videos
const ReportBugForm = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  // const [files, setFiles] = useState<UploadedPhoto[]>([]);
  const bugIssueTypeCodes = useSelector((state) => state.ActivityPage?.formCodes?.BugReportTypeCode);
  const { MOBILE } = useSelector((state) => state.Configuration.current.build);
  const {
    handleSubmit,
    register,
    formState: { errors }
  } = useFormContext<CreateBugReportInSchema>();

  const atLeastOne = (_, formValues) => {
    return formValues.online || formValues.offline || 'Select online or offline';
  };

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
        maxLength={100}
        required
        width={Width.Full}
        {...register('title', {
          required: true,
          validate: (val) => greaterThanEqual(val, 5)
        })}
      />
      <TextArea
        error={get(errors, 'description')}
        id="description"
        label={'Description/Steps You Took'}
        maxLength={8192}
        required
        width={Width.Full}
        {...register('description', {
          required: true,
          validate: (val) => greaterThanEqual(val, 5)
        })}
      />
      <TextArea id="expected_behavior" label={'Expected behavior'} maxLength={8192} width={Width.Full} />
      <GenericSingleSelect
        label={'Can you reproduce it?'}
        name={'reproducible'}
        options={[
          { label: 'Yes', value: 'Yes' },
          { label: 'No', value: 'No' }
        ]}
        required
        rules={{ required: true }}
        width={Width.Half}
      />
      <MobileOnly>
        <div className="checkbox-question-container">
          <p className="checkbox-question-label">Is this happening online or offline (or both)?</p>
          <div className="checkbox-container">
            <CheckboxInput
              label={'Offline'}
              {...register('offline', {
                deps: ['online'],
                validate: (val, formValues) => (MOBILE ? atLeastOne(val, formValues) : undefined)
              })}
              width={Width.Quarter}
            />
            <CheckboxInput
              label={'Online'}
              {...register('online', {
                deps: ['offline'],
                validate: (val, formValues) => (MOBILE ? atLeastOne(val, formValues) : undefined)
              })}
              width={Width.Quarter}
            />
          </div>
          {(errors.online || errors.offline) && <ErrorMessage error={{ type: 'required' }} label="Online or Offline" />}
        </div>
      </MobileOnly>
      <SingleSelect
        label={'Type of issue'}
        name={'issue_type'}
        options={bugIssueTypeCodes}
        required
        rules={{ required: true }}
        width={Width.Half}
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
      <Button color="primary" size="lg" type="submit" variant="contained">
        Submit Report
      </Button>
    </form>
  );
};

export default ReportBugForm;
