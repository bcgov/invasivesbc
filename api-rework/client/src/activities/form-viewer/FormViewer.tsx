import Fieldset from 'common-components/inputs/Fieldset';
import TextInput from 'common-components/inputs/TextInput';
import TextField from 'common-components/inputs/TextField';
import './formViewer.css';
import Spacer from 'common-components/inputs/Spacer';
import TerrestrialObservation from 'activities/subtypes/TerrestrialObservation';
import AquaticObservation from 'activities/subtypes/AquaticObservation';
import ChemicalMonitoring from 'activities/subtypes/ChemicalMonitoring';

const FormViewer = ({ formData }) => (
  <div className="content">
    <div className="form-viewer">
      <Fieldset label={'Basic Information'}>
        <TextInput label={'short id'} value={formData?.short_id} />
        <TextInput label={'activity date'} value={formData?.date} />
        <TextInput label={'created by'} value={formData?.created_by} />
        <TextInput label={'subtype'} value={formData?.subtype} />
        <TextInput label={'form status'} value={formData?.form_status} />
        <Spacer />
        <TextInput label={'latitude'} value={formData?.latitude} />
        <TextInput label={'longitude'} value={formData?.longitude} />
        <TextInput label={'area (m)'} value={formData?.area_m} />
        <TextInput label={'UTM Easting'} value={formData?.utm_easting} />
        <TextInput label={'UTM Northing'} value={formData?.utm_northing} />
        <TextInput label={'UTM Zone'} value={formData?.utm_zone} />
        <TextField label={'location description'} value={formData?.location_description} />
        <TextField label={'access description'} value={formData?.access_description} />
        <TextField label={'comment'} value={formData?.comment} />
      </Fieldset>
      <Fieldset label={'project codes'} small>
        {formData?.projects.map(({ description }) => (
          <TextInput value={description} />
        ))}
      </Fieldset>
      <Fieldset label={'employers'} small>
        {formData?.employer.map(({ employer }) => (
          <TextInput value={employer} />
        ))}
      </Fieldset>
      <Fieldset label={'funding agencies'} small>
        {formData?.funding_agencies.map(({ invasive_species_agency_code }) => (
          <TextInput value={invasive_species_agency_code} />
        ))}
      </Fieldset>
      <Fieldset label={'jurisdictions'} small>
        {formData?.jurisdictions.map(({ jurisdiction, percent_covered }) => (
          <div className="group-wrap">
            <TextInput label={'jurisdiction'} value={jurisdiction} />
            <TextInput label={'percent covered'} value={percent_covered} />
          </div>
        ))}
      </Fieldset>
      <Fieldset label={'participants'} small>
        {formData?.participants.map(({ name, pac_number }) => (
          <div className="group-wrap">
            {pac_number && <TextInput label={'PAC number'} value={pac_number} />}
            <TextInput label={'name'} value={name} />
          </div>
        ))}
      </Fieldset>
      <Fieldset label={'Linked Records'}>
        {formData?.linked_activities?.map(({ full, short_id }) => (
          <div className="group-wrap">
            <TextInput label={'Short ID'} value={short_id} />
            <TextInput label={'Full'} value={full} />
          </div>
        ))}
      </Fieldset>
      <Spacer />
      <Spacer />
      <h2>Subtype Specific Details</h2>
      {
        {
          Observation_Plant_Terrestrial: <TerrestrialObservation subtypeData={formData?.subtype_data} />,
          Observation_Plant_Aquatic: <AquaticObservation subtypeData={formData?.subtype_data} />,
          Monitoring_Chemical_Plant_Terrestrial_Aquatic: <ChemicalMonitoring subtypeData={formData?.subtype_data} />
        }[formData?.subtype]
      }
    </div>
  </div>
);

export default FormViewer;
