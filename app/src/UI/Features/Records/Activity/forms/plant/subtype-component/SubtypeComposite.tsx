import { ActivitySubtypes } from 'sharedAPI';
import { useSelector } from 'utils/use_selector';
import ObservationPlantTerrestrial from 'UI/Features/Records/Activity/forms/plant/subtype-component/observation-plant-terrestrial/ObservationPlantTerrestrial';
import ObservationPlantAquatic from 'UI/Features/Records/Activity/forms/plant/subtype-component/observation-plant-aquatic/ObservationPlantAquatic';
import TreatmentMechPlantTerrestrial from './treatment-mech-plant-terrestrial/TreatmentMechPlantTerrestrial';
import TreatmentMechPlantAquatic from './treatment-mech-plant-aquatic/TreatmentMechPlantAquatic';
import MonitoringChemMechPlant from './monitoring-chem-mech-plant/MonitoringChemMechPlant';
import BiocontrolRelease from './biocontrol-release/BiocontrolRelease';
import BiocontrolReleaseMonitoring from './biocontrol-release-monitoring/BiocontrolReleaseMonitoring';

/**
 * @desc Handles the Branching Subtypes for Forms, matches Subtype to required Subfields
 */
const SubtypeComposite = () => {
  const formType = useSelector((state) => state.ActivityPage?.formType);

  if (!formType) return;
  return {
    [ActivitySubtypes.Observation_Plant_Terrestrial]: <ObservationPlantTerrestrial />,
    [ActivitySubtypes.Observation_Plant_Aquatic]: <ObservationPlantAquatic />,
    [ActivitySubtypes.Monitoring_Chemical_Plant_Terrestrial_Aquatic]: <MonitoringChemMechPlant />,
    [ActivitySubtypes.Monitoring_Mechanical_Plant_Terrestrial_Aquatic]: <MonitoringChemMechPlant />,
    [ActivitySubtypes.Monitoring_Biocontrol_Release_Plant_Terrestrial]: <BiocontrolReleaseMonitoring />,
    [ActivitySubtypes.Treatment_Mechanical_Plant_Terrestrial]: <TreatmentMechPlantTerrestrial />,
    [ActivitySubtypes.Treatment_Mechanical_Plant_Aquatic]: <TreatmentMechPlantAquatic />,
    [ActivitySubtypes.Treatment_Chemical_Plant_Terrestrial]: (
      <p>Treatment_Chemical_Plant_Terrestrial Not Implemented</p>
    ),
    [ActivitySubtypes.Treatment_Chemical_Plant_Aquatic]: <p>Treatment_Chemical_Plant_Aquatic Not Implemented</p>,
    [ActivitySubtypes.Monitoring_Biocontrol_Dispersal_Plant_Terrestrial]: (
      <p>Monitoring_Biocontrol_Dispersal_Plant_Terrestrial Not Implemented</p>
    ),
    [ActivitySubtypes.Biocontrol_Collection]: <p>Biocontrol_Collection Not Implemented</p>,
    [ActivitySubtypes.Biocontrol_Release]: <BiocontrolRelease />
  }[formType];
};

export default SubtypeComposite;
