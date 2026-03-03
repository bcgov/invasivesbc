import { useFormContext } from 'react-hook-form';
import ArrayField from 'UI/Features/Records/Activity/forms/common/ArrayField/ArrayField';
import { Width } from 'UI/Features/Records/Activity/forms/common/utils';
import tooltips from 'UI/Features/Records/Activity/forms/plant/content/tooltips';
import {
  BiocontrolReleaseMonitoringSchema,
  BiocontrolReleaseSchema
} from 'UI/Features/Records/Activity/forms/plant/interfaces';
import { minValue, noRepeatKey } from 'UI/Features/Records/Activity/forms/common/validators';
import getDefaultFormState from 'UI/Features/Records/Activity/forms/plant/builders/getDefaultState';
import { ActivitySubtypes } from 'sharedAPI';
import SingleSelect from 'UI/Features/Records/Activity/forms/common/SingleSelect/SingleSelect';
import NumberInput from 'UI/Features/Records/Activity/forms/common/NumberInput/NumberInput';
import { useSelector } from 'utils/use_selector';
import DeleteControl from 'UI/Features/Records/Activity/forms/common/DeleteControl/DeleteControl';

type BiocontrolCountingSchemas = BiocontrolReleaseMonitoringSchema | BiocontrolReleaseSchema;

type AgentPath =
  | `subtype_data.entries.${number}.estimated_biological_agents`
  | `subtype_data.entries.${number}.actual_biological_agents`;

interface PropTypes {
  index: number;
  estimate?: boolean;
  extended?: boolean;
}
const BiocontrolCount = ({ index, estimate = false, extended = false }: PropTypes) => {
  /**
   * Validate That An Actual Estimate occurs in either the Actual or Estimated value.
   */
  const doesRowContainActualEstimatedAgents = (_, formValues: BiocontrolCountingSchemas) => {
    const totalCountEntries =
      formValues.subtype_data.entries[index].actual_biological_agents.length +
      formValues.subtype_data.entries[index].estimated_biological_agents.length;
    return totalCountEntries >= 1 || 'Record must contain at least one "Actual" or "Estimated" biological agents entry';
  };
  const {
    register,
    formState: { errors }
  } = useFormContext<BiocontrolCountingSchemas>();

  const codes = useSelector((state) => state.ActivityPage.formCodes);
  // Set Key configuration based on If Estimated/Actual Values.
  const CONFIG = (() => {
    if (estimate) {
      return {
        errors: errors?.subtype_data?.entries?.[index]?.estimated_biological_agents,
        path: `subtype_data.entries.${index}.estimated_biological_agents` as AgentPath,
        label: 'Estimated Biological Agents'
      };
    }
    return {
      errors: errors?.subtype_data?.entries?.[index]?.actual_biological_agents,
      path: `subtype_data.entries.${index}.actual_biological_agents` as AgentPath,
      label: 'Actual Biological Agents'
    };
  })();
  return (
    <ArrayField<BiocontrolCountingSchemas, AgentPath>
      label={CONFIG.label}
      name={CONFIG.path}
      tooltip={tooltips.plant.biocontrol.counts.title}
      width={Width.Half}
      rules={{
        validate: {
          noRepeatLifeStage: (val) => noRepeatKey(val, 'stage', 'Agent Stage'),
          mustIncludeEstimatedOrActual: doesRowContainActualEstimatedAgents
        }
      }}
      emptyValue={
        (
          getDefaultFormState(
            extended
              ? ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial
              : ActivitySubtypes.Biocontrol_Release
          ) as BiocontrolReleaseMonitoringSchema
        ).subtype_data.entries[0].estimated_biological_agents[0]
      }
      renderRow={(entryIndex, removeEntry) => (
        <>
          <SingleSelect
            tooltip={tooltips.plant.biocontrol.counts.agent_life_stage}
            name={`${CONFIG.path}.${entryIndex}.stage`}
            label={'Biological Agent Stage'}
            required
            rules={{ required: true }}
            options={codes.BioAgentLifeStageCode}
          />
          <NumberInput
            label={'Biological Agent Quantity'}
            tooltip={tooltips.plant.biocontrol.counts.quantity}
            required
            error={CONFIG.errors?.[entryIndex]?.quantity}
            {...register(`${CONFIG.path}.${entryIndex}.quantity`, {
              required: true,
              valueAsNumber: true,
              validate: (val) => minValue(val, 1)
            })}
          />
          {extended && (
            <>
              <SingleSelect
                tooltip={tooltips.plant.biocontrol.counts.agent_life_stage}
                name={`${CONFIG.path}.${entryIndex}.plant_position`}
                label={'Biological Plant Position'}
                required
                rules={{ required: true }}
                options={codes.PlantPositionCode}
              />
              <SingleSelect
                tooltip={tooltips.plant.biocontrol.counts.agent_life_stage}
                name={`${CONFIG.path}.${entryIndex}.agent_location`}
                label={'Biological Agent Location'}
                required
                rules={{ required: true }}
                options={codes.AgentLocationFoundCode}
              />
            </>
          )}
          <DeleteControl onClick={() => removeEntry(entryIndex)} />
        </>
      )}
    />
  );
};
export default BiocontrolCount;
