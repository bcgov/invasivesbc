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
      'Plain text description of any supporting information about the observation that is not captured elsewhere'
  },
  plant: {
    invasive_plant: 'Target invasive plant species for this observation at this location.',
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
        'Enter the secchi depth in metres. The secchi depth is the depth of water beyond which a high-contrast pattern on a submerged disk is no longer visible.'
    }
  }
};

export default tooltips;
