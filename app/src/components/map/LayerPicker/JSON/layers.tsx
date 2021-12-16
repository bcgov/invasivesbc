export const layers = (networkContext: boolean) => {
  return [
    {
      id: 'invasivesbc_records',
      name: 'INVASIVESBC Records',
      order: 0,
      zIndex: 6000,
      loaded: 70,
      enabled: false,
      children: [
        {
          id: 'all_lean_activities',
          name: 'All Records',
          source: 'null',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          layer_code: 'LEAN_ACTIVITIES',
          color_code: '#000',
          order: 0,
          opacity: 0.4,
          zIndex: 10,
          loaded: 70,
          enabled: false
        }
      ]
    },
    {
      id: 'iapp_records',
      name: 'IAPP Records',
      order: 1,
      zIndex: 5000,
      loaded: 70,
      enabled: false,
      children: [
        {
          id: 'all_lean_pois',
          name: 'All IAPP Records',
          source: 'null',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          layer_code: 'LEAN_POI',
          color_code: '#000',
          order: 0,
          opacity: 0.4,
          zIndex: 10,
          loaded: 70,
          enabled: false
        }
      ]
    },
    {
      id: 'administrative_boundaries',
      name: 'Administrative Boundaries',
      order: 2,
      zIndex: 4000,
      loaded: 70,
      enabled: false,
      children: [
        {
          id: 'regional_districts',
          name: 'Regional District - Legally Defined Administrative Areas of BC',
          source: 'null',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          bcgw_code: 'WHSE_LEGAL_ADMIN_BOUNDARIES.ABMS_REGIONAL_DISTRICTS_SP',
          color_code: '#000',
          order: 0,
          opacity: 0.4,
          zIndex: 50,
          loaded: 70,
          enabled: false
        },
        {
          id: 'municipality_boundaries',
          name: 'Municipality Boundaries',
          source: 'null',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          bcgw_code: 'WHSE_TANTALIS.TA_MUNICIPALITIES_SVW',
          color_code: '#000',
          order: 1,
          opacity: 0.4,
          zIndex: 40,
          loaded: 70,
          enabled: false
        },
        {
          id: 'first_nations_treaty_lands',
          name: 'First Nations Treaty Lands',
          source: 'null',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          bcgw_code: 'WHSE_LEGAL_ADMIN_BOUNDARIES.FNT_TREATY_LAND_SP',
          color_code: '#000',
          order: 2,
          opacity: 0.4,
          zIndex: 30,
          loaded: 70,
          enabled: false
        },
        {
          id: 'jurisdiction_layer',
          name: 'Jurisdiction Layaer',
          source: 'null',
          layer_mode: networkContext ? 'vector_tiles_online' : 'vector_tiles_offline',
          layer_code: 'JURISDICTIONS',
          color_code: '#000',
          order: 3,
          opacity: 0.4,
          zIndex: 20,
          loaded: 70,
          enabled: false
        },
        {
          id: 'riso_boundaries',
          name: 'RISO Boundaries',
          source: 'null',
          layer_mode: networkContext ? 'vector_tiles_online' : 'vector_tiles_offline',
          layer_code: 'RISO',
          color_code: '#000',
          order: 4,
          opacity: 0.4,
          zIndex: 10,
          loaded: 70,
          enabled: false
        }
      ]
    },
    {
      id: 'aquatic_layers_and_wells',
      name: 'Aquatic Layers and Wells',
      order: 3,
      zIndex: 3000,
      loaded: 70,
      enabled: false,
      children: [
        {
          id: 'bc_major_watersheds',
          name: 'BC Major Watersheds',
          source: 'null',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          bcgw_code: 'WHSE_BASEMAPPING.BC_MAJOR_WATERSHEDS',
          color_code: '#000',
          order: 0,
          opacity: 0.4,
          zIndex: 70,
          loaded: 70,
          enabled: false
        },
        {
          id: 'freshwater_atlas_rivers',
          name: 'Freshwater Atlas Rivers',
          source: 'null',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          bcgw_code: 'WHSE_BASEMAPPING.FWA_RIVERS_POLY',
          color_code: '#000',
          order: 1,
          opacity: 0.4,
          zIndex: 60,
          loaded: 70,
          enabled: false
        },
        {
          id: 'freshwater_lakes',
          name: ' Freshwater Lakes',
          source: 'null',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          bcgw_code: 'WHSE_LAND_AND_NATURAL_RESOURCE.EAUBC_LAKES_SP',
          color_code: '#000',
          order: 2,
          opacity: 0.4,
          zIndex: 50,
          loaded: 70,
          enabled: false
        },
        {
          id: 'freshwater_atlas_stream_network',
          name: 'Freshwater Atlas Stream Network',
          source: 'null',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          bcgw_code: 'WHSE_BASEMAPPING.FWA_STREAM_NETWORKS_SP',
          color_code: '#000',
          order: 3,
          opacity: 0.4,
          zIndex: 40,
          loaded: 70,
          enabled: false
        },
        {
          id: 'water_licenses_drinking_water',
          name: 'Water Licenses Drinking Water',
          source: 'null',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          bcgw_code: 'WHSE_WATER_MANAGEMENT.WLS_BC_POD_DRINKNG_SOURCES_SVW',
          color_code: '#000',
          order: 4,
          opacity: 0.4,
          zIndex: 30,
          loaded: 70,
          enabled: false
        },
        {
          id: 'water_rights_licenses',
          name: 'Water Rights Licenses',
          source: 'null',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          bcgw_code: 'WHSE_WATER_MANAGEMENT.WLS_WATER_RIGHTS_LICENCES_SV',
          color_code: '#000',
          order: 5,
          opacity: 0.4,
          zIndex: 20,
          loaded: 70,
          enabled: false
        },
        {
          id: 'water_wells',
          name: 'Water Wells',
          source: 'null',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          bcgw_code: 'WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW',
          color_code: '#000',
          order: 6,
          opacity: 0.4,
          zIndex: 10,
          loaded: 70,
          enabled: false
        }
      ]
    },
    {
      id: 'terrestial_layers',
      name: 'Terrestrial Layers',
      order: 4,
      zIndex: 2000,
      loaded: 70,
      enabled: false,
      children: [
        {
          id: 'digital_road_atlas',
          name: 'Digital Road Atlas (DRA) - Master Partially-Attributed Roads',
          source: 'null',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          bcgw_code: 'WHSE_BASEMAPPING.DRA_DGTL_ROAD_ATLAS_MPAR_SP',
          color_code: '#000',
          order: 0,
          opacity: 0.4,
          zIndex: 10,
          loaded: 70,
          enabled: false
        },
        {
          id: 'city_names',
          name: 'City Names',
          source: 'null',
          layer_mode: networkContext ? 'wms_online' : 'wfs_offline',
          bcgw_code: 'WHSE_BASEMAPPING.BC_MAJOR_CITIES_POINTS_500M',
          color_code: '#000',
          order: 1,
          opacity: 0.4,
          zIndex: 20,
          loaded: 70,
          enabled: false
        }
      ]
    },
    {
      id: 'user_uploaded_layers',
      name: 'User Uploaded Layers',
      order: 5,
      zIndex: 1000,
      loaded: 70,
      enabled: false,
      children: []
    }
  ];
};
