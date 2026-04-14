const tooltips = {
  basic: {
    area_m: 'Area of the activity automatically created from the geometry in square metres',
    latitude: 'Latitude of the anchor point for the specified geometry',
    longitude: 'Longitude of the anchor point for the specified geometry',
    utm_zone: 'UTM Zone of the anchor point for the specified geometry',
    utm_easting: 'UTM Easting of the anchor point for the specified geometry',
    utm_northing: 'UTM Northing of the anchor point for the specified geometry',
    date: 'The date the activity occurred on',
    participant: 'Details of person(s) present during the activity',
    pac_number: 'Valid Pesticide Applicator Certificate (PAC) number.',
    employer: 'The company or agency that the person(s) completing the activity is directly employed by',
    funding_agencies:
      'Choose the organization that is paying for the work to be done. If multiple funders exist or in cases when an agency has been hired to manage the work on behalf of the primary funding agency, multiple Funding Agencies may be chosen.',
    jurisdiction: 'Entity that owns or is responsible for the land base or water body',
    jurisdiction_percent_covered: 'Percent covered by this jurisdiction',
    projects:
      'Optional field that can be added to a record to enable searching/sorting for records with that project code entered later. Multiple project codes may be added eg. project areas, contract identifiers. Replaces "paper file ID" field used in IAPP',
    location_description:
      'Text entry to provide location directions. Locations should start general and get more specific',
    access_description: 'Text entry to provide access directions.',
    general_comments:
      'Plain text description of any supporting information about the observation that is not captured elsewhere',
    comment: 'Any comments of particular interest regarding this collection that does not fit elsewhere.',
    historical_iapp:
      'Record number from historical Invasive Alien Plant Program (IAPP) data, if known, to enable tracing to historical biocontrol records.',
    pretreatment_observation:
      'Choose yes if this observation was completed before any treatment occurred within the current growing season'
  },
  plant: {
    invasive_plant: 'Target invasive plant species at this location.',
    observation_type: 'Presence or absence of target invasive plants within a defined area.',
    density: 'Average number of individual plants per square meter expressed as a density class code',
    distribution:
      'Description of the average arrangement of invasive plant clusters within the observation area expressed as a distribution code',
    life_stage: 'Average phenological stage of plant; rosette, flowering, etc',

    voucher_specimen_collected: 'Ideal to collect entire plant structure for verification purposes.',
    voucher_sample_id: 'Unique identifier for each voucher collected.',
    soil_texture: 'Relative amount of sand, silt, clay, organic matter, and bedrock throughout the observation area',
    terrestrial_specific_use: 'Notable land uses or attributes within the observation area',
    slope_percent: 'Exact or general slope of the land expressed as a percentage',
    aspect: 'Average orientation that slope is facing within the observation area (ie; SE = southeast)',
    research_observation:
      'Is this observation part of a research project? Add details in project code or comments fields',
    visible_well_nearby: 'Is there a visible well nearby? Indicate the distance from the observation in the comments',
    suitable_for_biocontrol_agent:
      'Choose Yes if the infestation is large, evenly infested and the site is secure from future disturbance.',
    sample_point_id:
      'For Presence Surveys. Number each sample point in the same waterbody (e.g. 001, 002, 003, etc). Do not use for Extent Surveys',
    aquatic_plant:
      'For Presence survey: select species observed at coordinates. For Extent Survey: select target species for survey',
    chemical: {
      calculation_fields: {
        invasive_plant: '',
        area_covered: 'Percent of area covered by this species',
        tank_mix: '', // Was on the original form, but no details provided. Placeholding in case of change
        application_method: 'Choose treatment application method',
        herbicide_type: 'Choose whether the herbicide being used is liquid or granular',
        herbicide: 'Choose which herbicide you are using',
        calculation_type:
          'Product application rate: the label recommended rate for treatment of this species that was used to mix the treatment solution. In litres per hectare. Dilution % : the label recommended percent solution used to treat this species that was used to mix the treatment solution. Expressed as the percent of herbicide in the solution.',
        amount_mix_used: 'Volume in litres (ie 5.1 L) of herbicide and water mix',
        delivery_rate_of_mix: 'Calibrated delivery rate of the device used to apply herbicide in L/ha',
        application_rate: 'Recommended label rate for herbicide (L/ha) used for this treatment',
        dilution_percent: 'Percent (%) of product in the mix',
        area_treated_msq: 'Area Treated in square meters'
      },
      wells: {
        field_disclaimer:
          'Autofilled field when InvasivesBC detects a mapped well within the location of the treatment area. If nothing is entered, there are no mapped wells found however this does NOT mean there are no wells present. It is the applicators responsibility to confirm the absence of wells prior to applying herbicide at all times.',
        section_disclaimer:
          'These fields are autofilled if InvasivesBC detects a mapped well within the vicinity of a treatment. If nothing is entered, there are no mapped wells found however this does NOT mean there are no wells present. It is the applicators responsibility to confirm the absence of wells prior to applying herbicide at all times.'
      },
      service_license_number_and_company: 'Select from current/valid employer/organization names',
      pesticide_use_permit: 'Enter applicable number if treatment is being completed under pesticide use permit',
      pest_management_plan: 'Enter applicable number if treatment is being completed under a pest management plan',
      pest_management_plan_manual:
        'Include a PMP number here if it is not available on the drop down in the "Pest Management Plan',
      weather: {
        temperature_c: 'Measured in degrees celcius at time of treatment (ideally between 10 and 28 degrees)',
        wind_speed_kmh: 'Wind speed in km/hr at time of treatment (ideally less than 9km/hr)',
        wind_direction: 'Cardinal wind direction at time of treatment',
        humidity: 'Relative humidity expressed as a percentage'
      },
      treatment_notice_signs:
        'Indicate if treatment sign(s) were installed at entrance point to the treatment area. If no, indicate in the comments why not',
      required_under_license:
        'Required field under the BC Integrated Pest Management Regulation when working under a license or authorization',
      additional_unmapped_water:
        'Check this box as an indicator that there are wells or water licenses that will need to be considered if chemical treatment is planned for this area in the future. If unknown, leave unchecked. Additional information can be added into the comments (no names or addresses).'
    },
    waterbody: {
      type: 'Select best description of waterbody type',
      name_gazetted: 'Legal gazetted name of waterbody',
      name_local: 'Locally referred to name of waterbody',
      access: 'Waterbody access options, public access options preferred.',
      use: 'Choose all observed uses of waterbody that apply. If other is chosen, add details in the comments.',
      waterlevel_management:
        'Select existing infrastructure, if any, that could allow water level management. If other, specify in comment field',
      substrate_type: 'Select the most prevalent substrate composition',
      tidal_influence: 'Indicate if the water level at the observation point is influenced by tides',
      adjancent_land_use: 'Select all adjacent land uses that apply and add details in the comment box.',
      inflow:
        'Select one or more inflow types (aka upstream source) and indicate details or name of source water in the comments if known.',
      outflow:
        'Select one or more outflow types (downstream) and indicate details or name of outflow water in the comments if known.',
      shoreline_type:
        'Describe shoreline composition adjacent to observation (e.g. rip rap, road/parking lot, overhanging natural riparian veg, turf, fence, etc)',
      shoreline_percent: 'Percent covered by this shoreline type',
      depth: 'Enter the water depth in metres',
      secchi_depth:
        'Enter the secchi depth in metres. The secchi depth is the depth of water beyond which a high-contrast pattern on a submerged disk is no longer visible.',
      authorization_info:
        'Description of authorization permit for in-stream work (e.g. In-stream Notification, private landowner authorization in private pond, etc).'
    },
    evidence_of_treatment: 'Choose the efficacy of the treatment for the area that was treated.',
    treatment_pass:
      'Indicate whether you are monitoring the first or second treatment pass of the calendar year, if known',
    invasive_plant_on_site:
      'Choose one or more options to indicate whether target invasive plants are still found on site following the treatment.',
    monitoring_comment:
      'Note whether chlorosis, necrosis, curling, browning, yellow, epicormic growth etc. is observed, or any additional relevant information',
    treatment_efficacy_rating: 'Choose the efficacy of the treatment for the area that was treated.',
    management_efficacy_rating:
      'Choose the efficacy rating indicating the mortality of all the target species found on the site, including those that were not treated. Eg: 50% of plants on the site have evidence of treatment = Efficacy of 5.',
    disposed_material_format: 'If relevant, choose how the overall quantity/amount of removed biomass was calculated.',
    biocontrol: {
      weather: {
        temperature: 'Enter the highest temperature (in Celcius) that occurred during the activity',
        cloud_cover: 'Enter the average cloud cover over the duration of the activity',
        precipitation: 'Enter the average precipitation over the duration of the activity',
        wind_speed: 'Enter the average wind over the duration of the activity',
        wind_direction: 'Enter the average wind direction over the duration of the activity'
      },
      microsite: {
        mesoslope_position: 'Select the most representative mesoslope condition',
        site_surface_shape: 'Select the most representative slope shape'
      },
      agent: 'Genus species code of the agent (ie ALTICAR [Altica carduorum])',
      linear_segment: 'If the invasive plant infestation is primarily linear in nature, choose Yes.',
      mortality: 'Number of agents dead at time of release',
      agent_source:
        'Details of where the agents were collected or reared. Include IAPP site ID, InvasivesBC Collection # or description of location if source is outside of BC.',
      monitoring: {
        type: 'Choose whether the monitoring duration was timed or by the number of plants checked',
        suitable_for_collection:
          'Do the current biocontrol agent populations and location indicate that this may be a suitable collection site in the future? Add details in the comment field.',
        location_found:
          'Choose one or more general site location characteristics from the drop down to indicate where the biocontrol presence was observed.',
        count:
          'Enter the total duration in minutes, of all time spent monitoring by all people monitoring (added together).',
        method: 'Choose the method used for monitoring from the drop down'
      },
      plant_collected_from: 'If known, choose the species from the list that the agents were collected from',
      plant_collected_from_manual:
        'If the plant is not listed on the drop down in the previous field, type in the name of the plant the agents were collected from. Scientific name is preferred, but can be common name if required.',
      sign_of_presence:
        'Choose one or more from the drop down to indicate any visible sign of the agent(s) being present. Indicate current or prior year plus the type of evidence seen.',
      counts: {
        title: 'The quantity of the biocontrol agents in the life stage present.',
        agent_life_stage: 'Life stage of biocontrol agent',
        quantity:
          'Number is derived by an actual sub-sample count and multiplied by the total number of plants/plant parts the agent resides upon or within, e.g 5 larvae within a gall X 10 galls = 50 larvae'
      }
    },
    spread_results: {
      agent_density: 'Total # of bioagents at the site ÷ total # of plants surveyed (or sweeps) x 100',
      plant_attack: 'Total # of plants with bioagents at the site ÷ total # of plants surveyed (or sweeps) x 100',
      max_spread_m: 'Distance (m): Record the greatest distance the agent has spread over the site.',
      max_spread_deg: 'Aspect (degrees): Record the direction/aspect of the greatest distance the agent has spread.',
      recorded:
        'Optional monitoring technique that records the distance biocontrol agents have spread beyond the release UTM. Beyond 100m is Dispersal monitoring.'
    }
  }
};

export default tooltips;
