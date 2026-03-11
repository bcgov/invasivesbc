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
          quantity: 0,
          stage: ''
        }
      ],
      estimated_biological_agents: [
        {
          quantity: 0,
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
    target_plant_heights: [
      {
        height_cm: 0
      }
    ]
  },
  mesoslope_position: '',
  site_surface_shape: '',
  comments: '',
  cloud_cover: '',
  precipitation: '',
  temperature: 0,
  wind_direction: '',
  wind_speed_kmh: 0
});

export default getBiocontrolCollectionSubtypeFields;
