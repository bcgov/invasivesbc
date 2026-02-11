import { ActivitySubtypes } from 'sharedAPI';
import { useSelector } from 'utils/use_selector';
import ObservationPlantTerrestrial from './ObservationPlantTerrestrial';
import ObservationPlantAquatic from './ObservationPlantAquatic';

/**
 * @desc Handles the Branching Subtypes for Forms, matches Subtype to required Subfields
 */
const SubtypeComposite = () => {
  const formType = useSelector((state) => state.ActivityPage?.formType);

  if (!formType) return;
  return {
    [ActivitySubtypes.Observation_Plant_Terrestrial]: <ObservationPlantTerrestrial />,
    [ActivitySubtypes.Observation_Plant_Aquatic]: <ObservationPlantAquatic />,
    [ActivitySubtypes.Monitoring_Chemical_Plant_Terrestrial_Aquatic]: (
      <p>Monitoring_Chemical_Plant_Terrestrial_Aquatic Not Implemented</p>
    ),
    [ActivitySubtypes.Monitoring_Mechanical_Plant_Terrestrial_Aquatic]: (
      <p>Monitoring_Mechanical_Plant_Terrestrial_Aquatic Not Implemented</p>
    ),
    [ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial]: (
      <p>Monitoring_Biocontrol_Release_Plant_Terrestrial Not Implemented</p>
    ),
    [ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial]: (
      <p>Treatment_Mechanical_Plant_Terrestrial Not Implemented</p>
    ),
    [ActivitySubtypes.Treatment_Mechanical_Plant_Aquatic]: <p>Treatment_Mechanical_Plant_Aquatic Not Implemented</p>,
    [ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial]: (
      <p>Treatment_Chemical_Plant_Terrestrial Not Implemented</p>
    ),
    [ActivitySubtypes.Treatment_Chemical_Plant_Aquatic]: <p>Treatment_Chemical_Plant_Aquatic Not Implemented</p>,
    [ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial]: (
      <p>Monitoring_Biocontrol_Dispersal_Plant_Terrestrial Not Implemented</p>
    ),
    [ActivitySubtypes.Biocontrol_Collection]: <p>Biocontrol_Collection Not Implemented</p>,
    [ActivitySubtypes.Biocontrol_Release]: <p>Biocontrol_Release Not Implemented</p>
  }[formType];
};

export default SubtypeComposite;
