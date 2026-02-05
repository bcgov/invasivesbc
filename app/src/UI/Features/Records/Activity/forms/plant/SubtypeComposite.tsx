import { ActivitySubtype } from 'sharedAPI';
import { useSelector } from 'utils/use_selector';
import ObservationPlantTerrestrial from './ObservationPlantTerrestrial';
import ObservationPlantAquatic from './ObservationPlantAquatic';

/**
 * @desc Handles the Branching Subtypes for Forms, matches Subtype to required Subfields
 */
const SubtypeComposite = () => {
  const activity_subtype = useSelector((state) => state.ActivityPage?.activity?.activity_subtype);

  return {
    [ActivitySubtype.Treatment_ChemicalPlant]: <p>Treatment_ChemicalPlant</p>,
    [ActivitySubtype.Observation_PlantTerrestrial]: <ObservationPlantTerrestrial />,
    [ActivitySubtype.Observation_PlantAquatic]: <ObservationPlantAquatic />
  }[activity_subtype];
};

export default SubtypeComposite;
