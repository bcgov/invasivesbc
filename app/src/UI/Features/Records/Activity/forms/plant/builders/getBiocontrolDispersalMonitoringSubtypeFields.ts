import { BiocontrolDispersalMonitoringSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';

const getBiocontrolDispersalMonitoringSubtypeFields = (): BiocontrolDispersalMonitoringSchema['subtype_data'] => ({
  entries: [
    {
      biocontrol_agent: '',
      biocontrol_present: undefined,
      invasive_plant: '',
      monitoring_type: '',
      monitoring_method: '',
      count_duration_minutes: NaN,
      plant_count: NaN,
      location_agent_found: [],
      linear_segment: '',
      sign_of_biocontrol_presence: [],
      start_time: '',
      stop_time: '',
      suitable_for_collection: '',
      actual_biological_agents: [
        {
          quantity: NaN,
          stage: '',
          plant_position: '',
          agent_location: ''
        }
      ],
      estimated_biological_agents: [
        {
          quantity: NaN,
          stage: '',
          plant_position: '',
          agent_location: ''
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
  // Microsite Condition
  microsite_conditions: {
    mesoslope_position: '',
    site_surface_shape: ''
  },
  // Weather
  weather_conditions: {
    comments: '',
    cloud_cover: '',
    precipitation: '',
    temperature: NaN,
    wind_direction: '',
    wind_speed_kmh: NaN
  }
});

export default getBiocontrolDispersalMonitoringSubtypeFields;
