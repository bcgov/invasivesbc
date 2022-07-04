export const layersJSON = (networkContext: boolean, zoomLevel: number, existingLayers?: any) => {
  let returnVal;

  const layers = [
    {
      id: 'invasivesbc_records',
      name: 'INVASIVESBC Records',
      source: 'INVASIVESBC',
      order: 0,
      zIndex: 6000,
      loaded: 70,
      enabled: false,
      children: [
        {
          id: 'terrestrial_plant_observation',
          name: 'Terrestrial Plant Observation',
          source: 'INVASIVESBC',
          layer_code: 'LEAN_ACTIVITIES',
          layer_mode: networkContext ? 'wfs_online' : 'wfs_offline',
          activity_subtype: 'Activity_Observation_PlantTerrestrial',
          color_code: '#000',
          opacity: 1,
          zIndex: 50,
          loaded: 70,
          enabled: false
        },
        {
          id: 'aquatic_plant_observation',
          name: 'Aquatic Plant Observation',
          source: 'INVASIVESBC',
          layer_code: 'LEAN_ACTIVITIES',
          layer_mode: networkContext ? 'wfs_online' : 'wfs_offline',
          activity_subtype: 'Activity_Observation_PlantAquatic',
          color_code: '#000',
          order: 1,
          opacity: 1,
          zIndex: 50,
          loaded: 70,
          enabled: false
        },
        {
          id: 'terrestrial_plant_chemical_treatment',
          name: 'Terrestrial Plant Chemical Treatment',
          source: 'INVASIVESBC',
          layer_code: 'LEAN_ACTIVITIES',
          layer_mode: networkContext ? 'wfs_online' : 'wfs_offline',
          activity_subtype: 'Activity_Treatment_ChemicalPlantTerrestrial',
          color_code: '#000',
          order: 2,
          opacity: 1,
          zIndex: 50,
          loaded: 70,
          enabled: false
        },
        {
          id: 'aquatic_plant_chemical_treatment',
          name: 'Aquatic Plant Chemical Treatment',
          source: 'INVASIVESBC',
          layer_code: 'LEAN_ACTIVITIES',
          layer_mode: networkContext ? 'wfs_online' : 'wfs_offline',
          activity_subtype: 'Activity_Treatment_ChemicalPlantAquatic',
          color_code: '#000',
          order: 3,
          opacity: 1,
          zIndex: 50,
          loaded: 70,
          enabled: false
        },
        {
          id: 'terrestrial_plant_mechanical_treatment',
          name: 'Terrestrial Plant Mechanical Treatment',
          source: 'INVASIVESBC',
          layer_code: 'LEAN_ACTIVITIES',
          layer_mode: networkContext ? 'wfs_online' : 'wfs_offline',
          activity_subtype: 'Activity_Treatment_MechanicalPlantTerrestrial',
          color_code: '#000',
          order: 4,
          opacity: 1,
          zIndex: 50,
          loaded: 70,
          enabled: false
        },
        {
          id: 'aquatic_plant_mechanical_treatment',
          name: 'Aquatic Plant Mechanical Treatment',
          source: 'INVASIVESBC',
          layer_code: 'LEAN_ACTIVITIES',
          layer_mode: networkContext ? 'wfs_online' : 'wfs_offline',
          activity_subtype: 'Activity_Treatment_MechanicalPlantAquatic',
          color_code: '#000',
          order: 5,
          opacity: 1,
          zIndex: 50,
          loaded: 70,
          enabled: false
        },
        {
          id: 'plant_chemical_monitoring',
          name: 'Chemical Treatment Monitoring - Plant',
          source: 'INVASIVESBC',
          layer_code: 'LEAN_ACTIVITIES',
          layer_mode: networkContext ? 'wfs_online' : 'wfs_offline',
          activity_subtype: 'Activity_Treatment_ChemicalPlantAquatic',
          color_code: '#000',
          order: 6,
          opacity: 1,
          zIndex: 50,
          loaded: 70,
          enabled: false
        },
        {
          id: 'plant_mechanical_monitoring',
          name: 'Mechanical Treatment Monitoring - Plant',
          source: 'INVASIVESBC',
          layer_code: 'LEAN_ACTIVITIES',
          layer_mode: networkContext ? 'wfs_online' : 'wfs_offline',
          activity_subtype: 'Activity_Treatment_MechanicalPlantTerrestrial',
          color_code: '#000',
          order: 7,
          opacity: 1,
          zIndex: 50,
          loaded: 70,
          enabled: false
        },
        {
          id: 'biocontrol_collection',
          name: 'Biocontrol Collection',
          source: 'INVASIVESBC',
          layer_code: 'LEAN_ACTIVITIES',
          layer_mode: networkContext ? 'wfs_online' : 'wfs_offline',
          activity_subtype: 'Activity_Biocontrol_Collection',
          color_code: '#000',
          order: 8,
          opacity: 1,
          zIndex: 50,
          loaded: 70,
          enabled: false
        },
        {
          id: 'biocontrol_release',
          name: 'Biocontrol Release',
          source: 'INVASIVESBC',
          layer_code: 'LEAN_ACTIVITIES',
          layer_mode: networkContext ? 'wfs_online' : 'wfs_offline',
          activity_subtype: 'Activity_Biocontrol_Release',
          color_code: '#000',
          order: 9,
          opacity: 1,
          zIndex: 50,
          loaded: 70,
          enabled: false
        },
        {
          id: 'biocontrol_dispersal_monitoring',
          name: 'Biocontrol Dispersla Monitoring',
          source: 'INVASIVESBC',
          layer_code: 'LEAN_ACTIVITIES',
          layer_mode: networkContext ? 'wfs_online' : 'wfs_offline',
          activity_subtype: 'Activity_Monitoring_BiocontrolDispersal_TerrestrialPlant',
          color_code: '#000',
          order: 10,
          opacity: 1,
          zIndex: 50,
          loaded: 70,
          enabled: false
        },
        {
          id: 'biocontrol_release_monitoring',
          name: 'Biocontrol Release Monitoring',
          source: 'INVASIVESBC',
          layer_code: 'LEAN_ACTIVITIES',
          layer_mode: networkContext ? 'wfs_online' : 'wfs_offline',
          activity_subtype: 'Activity_Monitoring_BiocontrolRelease_TerrestrialPlant',
          color_code: '#000',
          order: 11,
          opacity: 1,
          zIndex: 50,
          loaded: 70,
          enabled: false
        }
      ]
    },
    {
      id: 'iapp_records',
      name: 'IAPP Records',
      order: 1,
      zIndex: 7000,
      source: 'INVASIVESBC',
      loaded: 70,
      enabled: true,
      children: [
        {
          id: 'sites',
          name: 'All Sites',
          source: 'INVASIVESBC',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          layer_code: 'LEAN_POI',
          poi_type: 'SITES',
          color_code: '#000',
          order: 0,
          opacity: 1,
          zIndex: 80,
          loaded: 70,
          enabled: true
        },
        {
          id: 'surveys',
          name: 'Surveys',
          source: 'INVASIVESBC',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          layer_code: 'LEAN_POI',
          poi_type: 'SURVEYS',
          color_code: '#000',
          order: 1,
          opacity: 1,
          zIndex: 70,
          loaded: 70,
          enabled: false
        },
        {
          id: 'chemical_treatment',
          name: 'Chemical Treatment',
          source: 'INVASIVESBC',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          layer_code: 'LEAN_POI',
          poi_type: 'CHEMICAL_TREATMENT',
          color_code: '#000',
          order: 2,
          opacity: 1,
          zIndex: 60,
          loaded: 70,
          enabled: false
        },
        {
          id: 'mechanical_treatment',
          name: 'Mechanical Treatment',
          source: 'INVASIVESBC',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          layer_code: 'LEAN_POI',
          poi_type: 'MECHANICAL_TREATMENTS',
          color_code: '#000',
          order: 3,
          opacity: 1,
          zIndex: 50,
          loaded: 70,
          enabled: false
        },
        {
          id: 'monitoring_records',
          name: 'Monitoring Records',
          source: 'INVASIVESBC',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          layer_code: 'LEAN_POI',
          poi_type: 'MONITORING_RECORDS',
          color_code: '#000',
          order: 4,
          opacity: 1,
          zIndex: 40,
          loaded: 70,
          enabled: false
        },
        {
          id: 'biocontrol_release',
          name: 'Biocontrol Release',
          source: 'INVASIVESBC',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          layer_code: 'LEAN_POI',
          poi_type: 'BIOCONTROL_RELEASE',
          color_code: '#000',
          order: 5,
          opacity: 1,
          zIndex: 30,
          loaded: 70,
          enabled: false
        },
        {
          id: 'biocontrol_dispersal',
          name: 'Biocontrol Dispersal',
          source: 'INVASIVESBC',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          layer_code: 'LEAN_POI',
          poi_type: 'BIOCONTROL_DISPERSAL',
          color_code: '#000',
          order: 6,
          opacity: 1,
          zIndex: 20,
          loaded: 70,
          enabled: false
        },
        {
          id: 'biocontrol_monitoring',
          name: 'Biocontrol Monitoring',
          source: 'INVASIVESBC',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          layer_code: 'LEAN_POI',
          poi_type: 'BIOCONTROL_MONITORING',
          color_code: '#000',
          order: 7,
          opacity: 1,
          zIndex: 10,
          loaded: 70,
          enabled: false
        }
        // {
        //   id: 'surveys',
        //   name: 'Surveys',
        //   source: 'INVASIVESBC',
        //   layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
        //   layer_code: 'LEAN_POI',
        //   poi_type: 'SURVEYS',
        //   color_code: '#000',
        //   order: 1,
        //   opacity: 0.4,
        //   zIndex: 70,
        //   loaded: 70,
        //   enabled: false
        // },
        // {
        //   id: 'chemical_treatment',
        //   name: 'Chemical Treatment',
        //   source: 'INVASIVESBC',
        //   layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
        //   layer_code: 'LEAN_POI',
        //   poi_type: 'CHEMICAL_TREATMENT',
        //   color_code: '#000',
        //   order: 2,
        //   opacity: 0.4,
        //   zIndex: 60,
        //   loaded: 70,
        //   enabled: false
        // },
        // {
        //   id: 'mechanical_treatment',
        //   name: 'Mechanical Treatment',
        //   source: 'INVASIVESBC',
        //   layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
        //   layer_code: 'LEAN_POI',
        //   poi_type: 'MECHANICAL_TREATMENTS',
        //   color_code: '#000',
        //   order: 3,
        //   opacity: 0.4,
        //   zIndex: 50,
        //   loaded: 70,
        //   enabled: false
        // },
        // {
        //   id: 'monitoring_records',
        //   name: 'Monitoring Records',
        //   source: 'INVASIVESBC',
        //   layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
        //   layer_code: 'LEAN_POI',
        //   poi_type: 'MONITORING_RECORDS',
        //   color_code: '#000',
        //   order: 4,
        //   opacity: 0.4,
        //   zIndex: 40,
        //   loaded: 70,
        //   enabled: false
        // },
        // {
        //   id: 'biocontrol_release',
        //   name: 'Biocontrol Release',
        //   source: 'INVASIVESBC',
        //   layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
        //   layer_code: 'LEAN_POI',
        //   poi_type: 'BIOCONTROL_RELEASE',
        //   color_code: '#000',
        //   order: 5,
        //   opacity: 0.4,
        //   zIndex: 30,
        //   loaded: 70,
        //   enabled: false
        // },
        // {
        //   id: 'biocontrol_dispersal',
        //   name: 'Biocontrol Dispersal',
        //   source: 'INVASIVESBC',
        //   layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
        //   layer_code: 'LEAN_POI',
        //   poi_type: 'BIOCONTROL_DISPERSAL',
        //   color_code: '#000',
        //   order: 6,
        //   opacity: 0.4,
        //   zIndex: 20,
        //   loaded: 70,
        //   enabled: false
        // },
        // {
        //   id: 'biocontrol_monitoring',
        //   name: 'Biocontrol Monitoring',
        //   source: 'INVASIVESBC',
        //   layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
        //   layer_code: 'LEAN_POI',
        //   poi_type: 'BIOCONTROL_MONITORING',
        //   color_code: '#000',
        //   order: 7,
        //   opacity: 0.4,
        //   zIndex: 10,
        //   loaded: 70,
        //   enabled: false
        // }
      ]
    },
    {
      id: 'administrative_boundaries',
      name: 'Administrative Boundaries',
      order: 2,
      zIndex: 6000,
      source: ['DATABC', 'INVASIVESBC'],
      loaded: 70,
      enabled: false,
      children: [
        {
          id: 'regional_districts',
          name: 'Regional District - Legally Defined Administrative Areas of BC',
          source: 'DATABC',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          bcgw_code: 'WHSE_LEGAL_ADMIN_BOUNDARIES.ABMS_REGIONAL_DISTRICTS_SP',
          color_code: '#000',
          order: 0,
          opacity: 0.4,
          zIndex: 50,
          loaded: 70,
          enabled: false,
          dataBCAcceptsGeometry: false,
          simplifyPercentage: 0.02
        },
        {
          id: 'municipality_boundaries',
          name: 'Municipality Boundaries',
          source: 'DATABC',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          bcgw_code: 'WHSE_LEGAL_ADMIN_BOUNDARIES.ABMS_MUNICIPALITIES_SP',
          color_code: '#000',
          order: 1,
          opacity: 0.4,
          zIndex: 40,
          loaded: 70,
          enabled: false,
          dataBCAcceptsGeometry: false,
          simplifyPercentage: 0.02
        },
        {
          id: 'first_nations_treaty_lands',
          name: 'First Nations Treaty Lands',
          source: 'DATABC',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          bcgw_code: 'WHSE_LEGAL_ADMIN_BOUNDARIES.FNT_TREATY_LAND_SP',
          color_code: '#000',
          order: 2,
          opacity: 0.4,
          zIndex: 30,
          loaded: 70,
          enabled: false,
          dataBCAcceptsGeometry: true
        },
        {
          id: 'jurisdiction_layer',
          name: 'Jurisdiction Layer',
          source: 'INVASIVESBC',
          layer_mode: networkContext ? 'vector_tiles_online' : 'vector_tiles_offline',
          layer_code: 'JURISDICTION_LAYER',
          color_code: '#000',
          order: 3,
          opacity: 0.4,
          zIndex: 20,
          loaded: 70,
          enabled: false,
          dataBCAcceptsGeometry: true
        },
        {
          id: 'riso_boundaries',
          name: 'RISO Boundaries',
          source: 'INVASIVESBC',
          layer_mode: networkContext ? 'vector_tiles_online' : 'vector_tiles_offline',
          layer_code: 'RISO_BOUNDARIES',
          color_code: '#000',
          order: 4,
          opacity: 0.4,
          zIndex: 100,
          loaded: 70,
          enabled: false,
          dataBCAcceptsGeometry: true
        }
      ]
    },
    {
      id: 'aquatic_layers_and_wells',
      name: 'Aquatic Layers and Wells',
      order: 3,
      zIndex: 5000,
      source: ['DATABC'],
      loaded: 70,
      enabled: false,
      children: [
        {
          id: 'bc_major_watersheds',
          name: 'BC Major Watersheds',
          source: 'DATABC',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          bcgw_code: 'WHSE_BASEMAPPING.BC_MAJOR_WATERSHEDS',
          color_code: '#000',
          order: 0,
          opacity: 0.4,
          zIndex: 70,
          loaded: 70,
          enabled: false,
          dataBCAcceptsGeometry: true
        },
        {
          id: 'freshwater_atlas_rivers',
          name: 'Freshwater Atlas Rivers',
          source: 'DATABC',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          bcgw_code: 'WHSE_BASEMAPPING.FWA_RIVERS_POLY',
          color_code: '#000',
          order: 1,
          opacity: 0.4,
          zIndex: 60,
          loaded: 70,
          enabled: false,
          dataBCAcceptsGeometry: true
        },
        {
          id: 'freshwater_lakes',
          name: ' Freshwater Lakes',
          source: 'DATABC',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          bcgw_code: 'WHSE_LAND_AND_NATURAL_RESOURCE.EAUBC_LAKES_SP',
          color_code: '#000',
          order: 2,
          opacity: 0.4,
          zIndex: 50,
          loaded: 70,
          enabled: false,
          dataBCAcceptsGeometry: true
        },
        {
          id: 'freshwater_atlas_stream_network',
          name: 'Freshwater Atlas Stream Network',
          source: 'DATABC',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          bcgw_code: 'WHSE_BASEMAPPING.FWA_STREAM_NETWORKS_SP',
          color_code: '#000',
          order: 3,
          opacity: 0.4,
          zIndex: 40,
          loaded: 70,
          enabled: false,
          dataBCAcceptsGeometry: true
        },
        {
          id: 'water_licenses_drinking_water',
          name: 'Water Licenses Drinking Water',
          source: 'DATABC',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          bcgw_code: 'WHSE_WATER_MANAGEMENT.WLS_BC_POD_DRINKNG_SOURCES_SP',
          color_code: '#000',
          order: 4,
          opacity: 0.4,
          zIndex: 30,
          loaded: 70,
          enabled: false,
          dataBCAcceptsGeometry: true
        },
        {
          id: 'water_rights_licenses',
          name: 'Water Rights Licenses',
          source: 'DATABC',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          bcgw_code: 'WHSE_WATER_MANAGEMENT.WLS_WATER_RIGHTS_LICENCES_SV',
          color_code: '#000',
          order: 5,
          opacity: 0.4,
          zIndex: 20,
          loaded: 70,
          enabled: false,
          dataBCAcceptsGeometry: true,
          simplifyPercentage: 0.02
        },
        {
          id: 'water_wells',
          name: 'Water Wells',
          source: 'DATABC',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          bcgw_code: 'WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW',
          color_code: '#000',
          order: 6,
          opacity: 1,
          zIndex: 10,
          loaded: 70,
          enabled: true,
          dataBCAcceptsGeometry: true
        }
      ]
    },
    {
      id: 'terrestial_layers',
      name: 'Terrestrial Layers',
      order: 4,
      zIndex: 4000,
      loaded: 70,
      source: ['DATABC'],
      enabled: false,
      children: [
        {
          id: 'digital_road_atlas',
          name: 'Digital Road Atlas (DRA) - Master Partially-Attributed Roads',
          source: 'DATABC',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          bcgw_code: 'WHSE_BASEMAPPING.DRA_DGTL_ROAD_ATLAS_MPAR_SP',
          color_code: '#000',
          order: 0,
          opacity: 0.4,
          zIndex: 10,
          loaded: 70,
          enabled: false,
          dataBCAcceptsGeometry: true
        },
        {
          id: 'city_names',
          name: 'City Names',
          source: 'DATABC',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          bcgw_code: 'WHSE_BASEMAPPING.BC_MAJOR_CITIES_POINTS_500M',
          color_code: '#000',
          order: 1,
          opacity: 0.4,
          zIndex: 20,
          loaded: 70,
          enabled: false,
          dataBCAcceptsGeometry: true
        }
      ]
    },
    {
      id: 'user_uploaded_layers',
      name: 'User Uploaded Layers',
      order: 5,
      zIndex: 3000,
      loaded: 70,
      enabled: false,
      children: []
    }
  ];

  if (!existingLayers) {
    returnVal = getLayerModes(layers, networkContext, zoomLevel);
  } else {
    returnVal = getLayerModes(existingLayers, networkContext, zoomLevel);
  }

  return returnVal;
};

enum LayerModes {
  WMS_Online = 'wms_online',
  WFS_Online = 'wfs_online',
  WFS_Offline = 'wfs_offline',
  VT_Online = 'vector_tiles_online',
  VT_Offline = 'vector_tiles_offline'
}

const getLayerModes = (inputLayers: any[], networkContext: boolean, zoomLevel: number): any[] => {
  let returnVal = inputLayers.map((parent) => {
    const newParent = { ...parent };
    const newChildren = newParent.children.map((child) => {
      return { ...child, layer_mode: getChildLayerMode(networkContext, zoomLevel, child.source) };
    });
    newParent.children = [...newChildren];
    return newParent;
  });
  return returnVal;
};

const getChildLayerMode = (networkContext: boolean, zoomLevel: number, source: string): LayerModes => {
  if (source === 'DATABC') {
    if (networkContext === true) {
      if (zoomLevel > 14) {
        return LayerModes.WFS_Online;
      } else {
        return LayerModes.WMS_Online;
      }
    } else {
      if (zoomLevel > 14) {
        return LayerModes.WFS_Offline;
      } else {
        return LayerModes.VT_Offline;
      }
    }
  } else {
    if (networkContext === true) {
      if (zoomLevel > 10) {
        return LayerModes.WFS_Online;
      } else {
        return LayerModes.VT_Online;
      }
    } else {
      if (zoomLevel > 10) {
        return LayerModes.WFS_Offline;
      } else {
        return LayerModes.VT_Offline;
      }
    }
  }
};
