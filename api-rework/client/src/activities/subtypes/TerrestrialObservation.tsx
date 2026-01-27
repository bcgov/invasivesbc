import Fieldset from 'common-components/Fieldset';
import TextInput from 'common-components/TextInput';

interface PropTypes {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subtypeData: Record<PropertyKey, any>;
}

const TerrestrialObservation = ({ subtypeData }: PropTypes) => {
  const BLANK = 'N/A';
  return (
    <>
      <Fieldset label={'observation info'}>
        <TextInput label="pretreatment observation" value={subtypeData?.pretreatment_observation} />
        <TextInput label="research observation" value={subtypeData?.research_observation} />
        <TextInput
          label="aspect"
          value={`${subtypeData?.aspect?.full ?? BLANK} (${subtypeData?.aspect?.code ?? BLANK})`}
        />
        <TextInput
          label="slope percent"
          value={`${subtypeData.slope_percent.full ?? BLANK} (${subtypeData.slope_percent.code ?? BLANK})`}
        />
        <TextInput
          label="soil texture"
          value={`${subtypeData?.soil_texture?.full ?? BLANK} (${subtypeData.soil_texture?.code ?? BLANK})`}
        />
        <TextInput label="specific use" value={`${subtypeData.specific_use.full} (${subtypeData.specific_use.code})`} />
        <TextInput label="suitable for biocontrol agent" value={subtypeData.suitable_for_biocontrol_agent} />
      </Fieldset>
      <Fieldset label={'observation details'}>
        {subtypeData?.observation_details.map((od) => (
          <div className="group-wrap">
            <TextInput label="density" value={od?.density} />
            <TextInput label="distribution" value={od?.distribution} />
            <TextInput label="invasive plant" value={od?.invasive_plant} />
            <TextInput label="life stage" value={od?.life_stage} />
            <TextInput label="observation type" value={od?.observation_type} />
            <TextInput label="voucher specimen" value={od?.voucher_specimen ? 'Yes' : 'No'} />
            {od?.voucher_specimen && (
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

export default TerrestrialObservation;
