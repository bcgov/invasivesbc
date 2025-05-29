import { ActivityStatus } from 'sharedAPI';
import { RecordSetType, UserRecordCacheStatus, UserRecordSet } from 'interfaces/UserRecordSet';
import { buildTimeConfig } from 'state/configuration/build-time-config';

const defaultRecordSets: Record<PropertyKey, Partial<UserRecordSet>> = {
  '1': {
    id: '1',
    idList: [],
    recordSetType: RecordSetType.Activity,
    recordSetName: 'My Drafts',
    // add draft key
    tableFilters: [
      {
        id: '1',
        field: 'form_status',
        filterType: 'tableFilter',
        filter: ActivityStatus.DRAFT,
        operator: 'CONTAINS',
        operator2: 'AND'
      }
    ],
    colorScheme: {
      Activity_Biocontrol_Collection: '#845ec2',
      Activity_Biocontrol_Release: '#845ec2',
      Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant: '#845ec2',
      Activity_Monitoring_BiocontrolRelease_TerrestrialPlant: '#845ec2',
      Activity_Monitoring_ChemicalTerrestrialAquaticPlant: '#2138e0',
      Activity_Monitoring_MechanicalTerrestrialAquaticPlant: '#2138e0',
      Activity_Observation_PlantAquatic: '#399c3e',
      Activity_Observation_PlantTerrestrial: '#399c3e',
      Activity_Treatment_ChemicalPlantAquatic: '#c6c617',
      Activity_Treatment_ChemicalPlantTerrestrial: '#c6c617',
      Activity_Treatment_MechanicalPlantAquatic: '#c6c617',
      Activity_Treatment_MechanicalPlantTerrestrial: '#c6c617'
    },
    cacheMetadataStatus: UserRecordCacheStatus.NOT_ELIGIBLE,
    drawOrder: 1
  },
  '2': {
    id: '2',
    idList: [],
    recordSetType: RecordSetType.Activity,
    recordSetName: 'All InvasivesBC Activities',
    colorScheme: {
      Activity_Biocontrol_Collection: '#845ec2',
      Activity_Biocontrol_Release: '#845ec2',
      Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant: '#845ec2',
      Activity_Monitoring_BiocontrolRelease_TerrestrialPlant: '#845ec2',
      Activity_Monitoring_ChemicalTerrestrialAquaticPlant: '#2138e0',
      Activity_Monitoring_MechanicalTerrestrialAquaticPlant: '#2138e0',
      Activity_Observation_PlantAquatic: '#399c3e',
      Activity_Observation_PlantTerrestrial: '#399c3e',
      Activity_Treatment_ChemicalPlantAquatic: '#c6c617',
      Activity_Treatment_ChemicalPlantTerrestrial: '#c6c617',
      Activity_Treatment_MechanicalPlantAquatic: '#c6c617',
      Activity_Treatment_MechanicalPlantTerrestrial: '#c6c617'
    },
    cacheMetadataStatus: UserRecordCacheStatus.NOT_ELIGIBLE,
    drawOrder: 2
  },
  '3': {
    recordSetType: RecordSetType.IAPP,
    id: '3',
    idList: [],
    recordSetName: 'All IAPP Records',
    color: '#21f34f',
    drawOrder: 3,
    cacheMetadataStatus: UserRecordCacheStatus.NOT_ELIGIBLE
  }
};

if (buildTimeConfig.MOBILE) {
  defaultRecordSets['4'] = {
    recordSetType: RecordSetType.Activity,
    id: '4',
    idList: [],
    recordSetName: 'All Unsynced Offline Activities',
    cacheMetadataStatus: UserRecordCacheStatus.NOT_ELIGIBLE,
    drawOrder: 4,
    mapToggle: true // by default
  };
}

export default defaultRecordSets;
