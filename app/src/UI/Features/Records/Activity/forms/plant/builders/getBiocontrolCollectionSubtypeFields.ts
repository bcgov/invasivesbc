import { BiocontrolCollectionSchema } from 'UI/Features/Records/Activity/forms/plant/interfaces';

const getBiocontrolCollectionSubtypeFields = (): BiocontrolCollectionSchema['subtype_data'] => ({
  entries: [
    {
      invasive_plant: '',
      biological_agent: '',
      collection_type: '',
      collection_method: '',
      start_time_collecting: '',
      end_time_collecting: '',
      comment: '',
      actual_biological_agents: [
        {
          quantity: NaN,
          stage: ''
        }
      ],
      estimated_biological_agents: [
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

export default getBiocontrolCollectionSubtypeFields;
