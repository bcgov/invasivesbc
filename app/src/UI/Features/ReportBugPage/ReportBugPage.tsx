import { CreateBugReportInSchema } from 'api/api-schema';
import { useForm, FormProvider } from 'react-hook-form';
import { defaultSchema } from './reportBugPage.consts';
import ReportBugForm from './ReportBugForm';
import OverlayContentWrapper from 'UI/Reusable/OverlayContentWrapper/OverlayContentWrapper';
import './reportBugPage.css';

const ReportBugPage = () => {
  const methods = useForm<CreateBugReportInSchema>({
    mode: 'onChange',
    defaultValues: defaultSchema
  });

  return (
    <OverlayContentWrapper>
      <div id="report-bug-page">
        <h1>Report a Bug</h1>
        <FormProvider {...methods}>
          <ReportBugForm />
        </FormProvider>
      </div>
    </OverlayContentWrapper>
  );
};

export default ReportBugPage;
