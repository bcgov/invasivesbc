export const Transect_FireMonitoring = {
  title: 'Fire Monitoring Information',
  type: 'object',
  required: ['transect_data', 'fire_monitoring_transect_lines'],
  properties: {
    transect_data: {
      $ref: '#/components/schemas/TransectData'
    },
    fire_monitoring_transect_lines: {
      type: 'array',
      default: [{}],
      title: 'Fire Monitoring Transect Lines',
      items: {
        $ref: '#/components/schemas/FireMonitoringTransectLines'
      }
    }
  }
};
export const Transect_Vegetation = {
  title: 'Vegetation Transect Information',
  type: 'object',
  required: ['transect_data', 'vegetation_transect_lines'],
  properties: {
    transect_data: {
      $ref: '#/components/schemas/TransectData'
    },
    vegetation_transect_lines: {
      type: 'array',
      default: [{}],
      title: 'Vegetation Transect Lines',
      items: {
        $ref: '#/components/schemas/VegetationTransectLines'
      }
    }
  }
};
export const Transect_BiocontrolEfficacy = {
  title: 'Biocontrol Efficacy Transect Information',
  type: 'object',
  required: ['transect_data', 'biocontrol_efficacy_transect_lines'],
  properties: {
    transect_data: {
      $ref: '#/components/schemas/TransectData'
    },
    transect_invasive_plants: {
      type: 'array',
      default: [{}],
      title: 'Targeted Species',
      items: {
        $ref: '#/components/schemas/TransectInvasivePlants'
      }
    },
    biocontrol_efficacy_transect_lines: {
      type: 'array',
      title: 'Biocontrol Efficacy Transect Lines',
      default: [{}],
      items: {
        $ref: '#/components/schemas/BiocontrolEfficacyTransectLines'
      }
    }
  }
};
