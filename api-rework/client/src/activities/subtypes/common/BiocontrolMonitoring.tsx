import ChitList from 'common-components/inputs/ChitList';
import Fieldset from 'common-components/inputs/Fieldset';
import Spacer from 'common-components/inputs/Spacer';
import TextInput from 'common-components/inputs/TextInput';

const BiocontrolMonitoring = ({ monitoring_information }) => (
  <Fieldset label={'Biological Monitoring Information'}>
    {monitoring_information.map((mi) => (
      <div className="group-wrap">
        <TextInput label={'Invasive plant'} value={mi.invasive_plant} />
        <TextInput label={'Biological Agent'} value={mi.biocontrol_agent} />
        <TextInput label={'Biocontrol Present'} value={mi.biocontrol_present ? 'Yes' : 'No'} />
        <TextInput label={'Plant Count'} value={mi.plant_count} />
        <TextInput label={'Count duration'} value={mi.count_duration_minutes} />
        <Spacer />
        <Fieldset small label={'Sign of biocontrol Present'}>
          <ChitList items={mi.sign_of_biocontrol_presence} />
        </Fieldset>
        <Fieldset small label={'Location Agent(s) Found'}>
          <ChitList items={mi.location_agent_found} />
        </Fieldset>
        <TextInput label={'Monitoring Type'} value={mi.monitoring_type} />
        <TextInput label={'Monitoring Method'} value={mi.monitoring_method} />
        <TextInput label={'Monitoring Start Time'} value={mi.start_time} />
        <TextInput label={'Monitoring End Time'} value={mi.stop_time} />

        <Fieldset small label={'Actual Biological Agents'}>
          {mi.actual_biological_agents?.map((ba) => (
            <div className="group-wrap">
              <TextInput label={'Life stage'} value={ba.stage} />
              <TextInput label={'Quantity'} value={ba.quantity} />
              <TextInput label={'Plant Position'} value={ba.plant_position} />
              <TextInput label={'Agent Location'} value={ba.agent_location} />
            </div>
          ))}
        </Fieldset>
        <Fieldset small label={'Estimated Biological Agents'}>
          {mi.estimated_biological_agents?.map((ba) => (
            <div className="group-wrap">
              <TextInput label={'Life stage'} value={ba.stage} />
              <TextInput label={'Quantity'} value={ba.quantity} />
              <TextInput label={'Plant Position'} value={ba.plant_position} />
              <TextInput label={'Agent Location'} value={ba.agent_location} />
            </div>
          ))}
        </Fieldset>
      </div>
    ))}
  </Fieldset>
);

export default BiocontrolMonitoring;
