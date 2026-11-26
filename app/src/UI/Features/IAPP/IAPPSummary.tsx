import { useSelector } from 'utils/use_selector';
import LoadingPage from 'UI/Features/SystemStatusPages/LoadingPage/LoadingPage';
import OverlayContentWrapper from 'UI/Reusable/OverlayContentWrapper/OverlayContentWrapper';
import { useParams } from 'react-router';
import { useEffect, useState } from 'react';
import { getCurrentJWT } from 'state/sagas/auth/auth';
import ErrorOccurredPage from 'UI/Features/SystemStatusPages/ErrorOccurredPage/ErrorOccurredPage';
import NotFoundPage from '../SystemStatusPages/NotFoundPage/NotFoundPage';
import Fieldset from 'UI/Features/Records/Activity/forms/common/Fieldset/Fieldset';
import TextInput from 'UI/Features/Records/Activity/forms/common/TextInput/TextInput';
import TextArea from 'UI/Features/Records/Activity/forms/common/TextArea/TextArea';
// import IAPPSurveyTable from './IAPPSurveyTable';
// import IAPPMechTreatmentTable from './IAPPMechTreatmentTable';
// import IAPPChemicalTreatmentTable from './IAPPChemicalTreatmentTable';
// import IAPPBiologicalTreatmentTable from './IAPPBiologicalTreatmentTable';
// import IAPPBiologicalDispersalTable from './IAPPBiologicalDispersalTable';

const IAPPSummary = () => {
  const { id, mode } = useParams<{ id: string; mode: string }>();
  const [site, setSite] = useState<Record<PropertyKey, any>>();
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const API_V2_BASE = useSelector((state) => state.Configuration.current.runtime.API_V2_BASE);

  useEffect(() => {
    (async () => {
      try {
        if (!id || id === 'undefined' || !!site) return;
        const res = await fetch(`${API_V2_BASE}/ninja/iapp/site/${id}`, {
          headers: { Authorization: await getCurrentJWT() }
        });
        if (res?.ok) setSite(await res.json());
      } catch (e) {
        console.error(e);
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);
  if (loading) return <LoadingPage />;
  if (error) return <ErrorOccurredPage />;
  if (!site) return <NotFoundPage />;
  return (
    <OverlayContentWrapper>
      <div id="iapp-summary" style={{ padding: '1rem', margin: '1rem' }}>
        <Fieldset label={`Legacy IAPP Site: ${site.site_id}`}>
          <TextInput value={site?.date_created ?? ''} label={'Date Created'} readOnly width={'Third'} required />
          <TextInput value={site?.paper_file_id ?? ''} label={'Paper File ID'} readOnly width={'Third'} required />
          <TextInput value={site?.map_sheet ?? ''} label={'Mapsheet'} readOnly width={'Third'} required />
          <TextInput value={site?.utm_zone ?? ''} label={'UTM Zone'} readOnly width={'Third'} required />
          <TextInput value={site?.utm_easting ?? ''} label={'UTM Easting'} readOnly width={'Third'} required />
          <TextInput value={site?.utm_northing ?? ''} label={'UTM Northing'} readOnly width={'Third'} required />
          <TextInput value={site?.longitude ?? ''} label={'Longitude'} readOnly width={'Third'} required />
          <TextInput value={site?.latitude ?? ''} label={'Latitude'} readOnly width={'Third'} required />
          <TextInput value={site?.elevation ?? ''} label={'Elevation'} readOnly width={'Third'} required />
          <TextInput value={site?.range_unit_id ?? ''} label={'Range Unit ID'} readOnly width={'Third'} required />
          <TextInput
            value={site?.specific_use_code ?? ''}
            label={'Site Specific Use'}
            readOnly
            width={'Third'}
            required
          />
          <TextInput value={site?.aspect_code ?? ''} label={'Aspect'} readOnly width={'Third'} required />
          <TextInput value={site?.slope_code ?? ''} label={'Slope (%)'} readOnly width={'Third'} required />
          <TextInput value={site?.soil_texture_code ?? ''} label={'Soil Texture'} readOnly width={'Third'} required />
          <TextInput value={site?.entered_by ?? ''} label={'Entered By'} readOnly width={'Third'} required />
          <TextInput value={site?.updated_by ?? ''} label={'Updated By'} readOnly width={'Third'} required />
          <TextInput value={site?.date_entered ?? ''} label={'Date Entered'} readOnly width={'Third'} required />
          <TextInput value={site?.date_updated ?? ''} label={'Date Updated'} readOnly width={'Third'} required />
          <TextArea value={site?.jurisdictions ?? ''} label={'Jurisdictions'} readOnly width={'Third'} required />
          <TextArea
            value={site?.access_description}
            label={'Site Location Details'}
            readOnly
            width={'Third'}
            required
          />
          <TextArea value={site?.general_comment} label={'Site Comments'} readOnly width={'Third'} required />
        </Fieldset>

        {/* <IAPPSurveyTable rows={site.surveys} /> */}
        {/* <IAPPMechTreatmentTable rows={site.mechanical_treatments} /> */}
        {/* <IAPPChemicalTreatmentTable rows={site.chemical_treatments} /> */}
        {/* <IAPPBiologicalTreatmentTable rows={site.biological_treatments} /> */}
        {/* <IAPPBiologicalDispersalTable rows={site.biological_dispersals} /> */}
      </div>
    </OverlayContentWrapper>
  );
};
export default IAPPSummary;
