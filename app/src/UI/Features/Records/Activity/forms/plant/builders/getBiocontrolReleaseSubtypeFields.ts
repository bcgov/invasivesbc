import { BiocontrolReleaseSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';

const getBioControlReleaseSubtypeFields = (): BiocontrolReleaseSchema['subtype_data'] => ({
  entries: [
    {
      agent_source: '',
      biocontrol_agent: '',
      collection_date: '',
      linear_segment: '',
      invasive_plant: '',
      mortality: NaN,
      plant_collected_from: '',
      plant_collected_from_manual: '',
      estimated_biological_agents: [
        {
          quantity: NaN,
          stage: ''
        }
      ],
      actual_biological_agents: [
        {
          quantity: NaN,
          stage: ''
        }
      ]
    }
  ],
  target_plant_phenology: {
    winter_dormant: 0,
    seedlings: 0,
    rosettes: 0,
    bolts: 0,
    flowering: 0,
    seeds_forming: 0,
    senescent: 0,
    target_plant_heights: []
  },
  microsite_conditions: {
    mesoslope_position: '',
    site_surface_shape: ''
  },
  weather_conditions: {
    comments: '',
    cloud_cover: '',
    precipitation: '',
    temperature: NaN,
    wind_direction: '',
    wind_speed_kmh: NaN
  }
});

export default getBioControlReleaseSubtypeFields;
