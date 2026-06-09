import { BiocontrolReleaseMonitoringSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';

const getMonitoringBiocontrolReleaseSubtypeFields = (): BiocontrolReleaseMonitoringSchema['subtype_data'] => ({
  entries: [
    {
      biocontrol_agent: '',
      biocontrol_present: undefined,
      invasive_plant: '',
      monitoring_type: '',
      monitoring_method: '',
      count_duration_minutes: undefined,
      plant_count: undefined,
      location_agent_found: [],
      sign_of_biocontrol_presence: [],
      start_time: '',
      stop_time: '',
      suitable_for_collection: '',
      actual_biological_agents: [
        {
          quantity: 0,
          stage: '',
          plant_position: '',
          agent_location: ''
        }
      ],
      estimated_biological_agents: [
        {
          quantity: 0,
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
    target_plant_heights: [{ height_cm: 0 }]
  },
  // Microsite Condition
  microsite_conditions: {
    mesoslope_position: '',
    site_surface_shape: ''
  },
  // Spread Results
  spread_results: {
    agent_density: 0,
    plant_attack: 0,
    max_spread_distance_m: 0,
    max_spread_aspect_deg: 0
  },
  // Weather
  weather_conditions: {
    comments: '',
    cloud_cover: '',
    precipitation: '',
    temperature: 0,
    wind_direction: '',
    wind_speed_kmh: 0
  }
});

export default getMonitoringBiocontrolReleaseSubtypeFields;
