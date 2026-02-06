import ChitList from 'common-components/inputs/ChitList';
import Fieldset from 'common-components/inputs/Fieldset';
import Spacer from 'common-components/inputs/Spacer';
import TextInput from 'common-components/inputs/TextInput';
import { SubtypeData } from 'constants';

const AquaticObservation = ({ subtypeData }: SubtypeData) => {
  const BLANK = 'N/A';
  return (
    <>
      <Fieldset label={'observation info'}>
        <TextInput label="pretreatment observation" value={subtypeData?.pretreatment_observation ?? BLANK} />
        <Spacer />
        <Fieldset small label="adjacent land use">
          <ChitList items={subtypeData?.adjacent_land_use} />
        </Fieldset>
        <Fieldset small label="subtrate type">
          <ChitList items={subtypeData?.substrate_type} />
        </Fieldset>
        <Fieldset small label="Waterbody Use">
          <ChitList items={subtypeData?.waterbody_use} />
        </Fieldset>
        <Fieldset small label="waterlevel management">
          <ChitList items={subtypeData?.waterlevel_management} />
        </Fieldset>
        <Fieldset small label="Inflow (permanent)">
          <ChitList items={subtypeData?.inflow_permanent} />
        </Fieldset>
        <Fieldset small label="Inflow (Seasonal)">
          <ChitList items={subtypeData?.inflow_seasonal} />
        </Fieldset>
        <Fieldset small label="Outflow (Permanent)">
          <ChitList items={subtypeData?.outflow_permanent} />
        </Fieldset>
        <Fieldset small label="Outflow (Seasonal)">
          <ChitList items={subtypeData?.outflow_seasonal} />
        </Fieldset>

        <Fieldset small label="Shoreline Types">
          {subtypeData.shoreline_types.map((li) => (
            <div className="group-wrap">
              <TextInput label="shoreline type" value={li.shoreline_type} />
              <TextInput label="percent covered" value={li.percent_covered} />
            </div>
          ))}
        </Fieldset>
      </Fieldset>
      <Fieldset label={'Observation Information'}>
        <TextInput label={'suitable for biocontrol'} value={subtypeData?.suitable_for_biocontrol} />
      </Fieldset>
      <Fieldset label={'observation details'}>
        {subtypeData?.entries.map((od) => (
          <div className="group-wrap">
            <TextInput label="density" value={od.density} />
            <TextInput label="distribution" value={od.distribution} />
            <TextInput label="invasive_plant" value={od.invasive_plant} />
            <TextInput label="life_stage" value={od.life_stage} />
            <TextInput label="observation_type" value={od.observation_type} />
            <TextInput label="sample_point_id" value={od.sample_point_id} />
            <TextInput label="voucher specimen" value={od?.voucher_specimen ? 'Yes' : 'No'} />

            {!!od?.voucher_specimen && (
              <>
                <TextInput label="invasive plant" value={od?.voucher_specimen?.invasive_plant} />
                <TextInput label="voucher sample id" value={od?.voucher_specimen?.voucher_sample_id} />
                <TextInput label="date collected" value={od?.voucher_specimen?.date_collected} />
                <TextInput label="date verified" value={od?.voucher_specimen?.date_verified} />
                <TextInput label="herbarium" value={od?.voucher_specimen?.herbarium} />
                <TextInput label="accession number" value={od?.voucher_specimen?.accession_number} />
                <TextInput label="completed by person" value={od?.voucher_specimen?.completed_by_person} />
                <TextInput label="completed by org" value={od?.voucher_specimen?.completed_by_org} />
                <TextInput label="utm zone" value={od?.voucher_specimen?.utm_zone} />
                <TextInput label="utm easting" value={od?.voucher_specimen?.utm_easting} />
                <TextInput label="utm northing" value={od?.voucher_specimen?.utm_northing} />
              </>
            )}
          </div>
        ))}
      </Fieldset>
    </>
  );
};

export default AquaticObservation;
