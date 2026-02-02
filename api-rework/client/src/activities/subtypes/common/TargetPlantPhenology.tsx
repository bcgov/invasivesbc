import Fieldset from 'common-components/inputs/Fieldset';
import TextInput from 'common-components/inputs/TextInput';

const TargetPlantPhenology = ({ targetPlantPhenology }) => (
  <Fieldset label={'Target Plant Phenology'}>
    <TextInput label={'Bolts'} value={targetPlantPhenology.bolts} />
    <TextInput label={'Flowering'} value={targetPlantPhenology.flowering} />
    <TextInput label={'rosettes'} value={targetPlantPhenology.rosettes} />
    <TextInput label={'seedlings'} value={targetPlantPhenology.seedlings} />
    <TextInput label={'seeds forming'} value={targetPlantPhenology.seeds_forming} />
    <TextInput label={'senescent'} value={targetPlantPhenology.senescent} />
    <TextInput label={'winter dormant'} value={targetPlantPhenology.winter_dormant} />
    <Fieldset small label={'target plant heights'}>
      {targetPlantPhenology.target_plant_heights.map((h) => (
        <TextInput value={h} />
      ))}
    </Fieldset>
  </Fieldset>
);

export default TargetPlantPhenology;
