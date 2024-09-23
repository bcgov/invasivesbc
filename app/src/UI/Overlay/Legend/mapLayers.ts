const mapLayers = [
  {
    layerPickerLabel: 'Regional Districts',
    objectName: 'WHSE_LEGAL_ADMIN_BOUNDARIES.ABMS_REGIONAL_DISTRICTS_SP'
  },
  {
    layerPickerLabel: 'BC Parks',
    objectName: 'WHSE_TANTALIS.TA_PARK_ECORES_PA_SVW'
  },
  {
    layerPickerLabel: 'Municipality Boundaries',
    objectName: 'WHSE_LEGAL_ADMIN_BOUNDARIES.ABMS_MUNICIPALITIES_SP'
  },
  {
    layerPickerLabel: 'BC Major Watersheds',
    objectName: 'WHSE_BASEMAPPING.BC_MAJOR_WATERSHEDS'
  },
  {
    layerPickerLabel: 'Freshwater Atlas Rivers',
    objectName: 'WHSE_BASEMAPPING.FWA_RIVERS_POLY'
  },
  {
    layerPickerLabel: 'Freshwater Lakes',
    objectName: 'WHSE_LAND_AND_NATURAL_RESOURCE.EAUBC_LAKES_SP'
  },
  {
    layerPickerLabel: 'Freshwater Atlas Stream Network',
    objectName: 'WHSE_BASEMAPPING.FWA_STREAM_NETWORKS_SP'
  },
  {
    layerPickerLabel: 'Water Licenses Drinking Water',
    objectName: 'WHSE_WATER_MANAGEMENT.WLS_BC_POD_DRINKNG_SOURCES_SP'
  },
  {
    layerPickerLabel: 'Water Rights Licenses',
    objectName: 'WHSE_WATER_MANAGEMENT.WLS_WATER_RIGHTS_LICENCES_SV'
  },
  {
    layerPickerLabel: 'Water Wells',
    objectName: 'WHSE_WATER_MANAGEMENT.GW_WATER_WELLS_WRBC_SVW'
  },
  {
    layerPickerLabel: 'Digital Road Atlas (DRA) - Master Partially-Attributed Roads',
    objectName: 'WHSE_BASEMAPPING.DRA_DGTL_ROAD_ATLAS_MPAR_SP'
  },
  {
    layerPickerLabel: 'MOTI RFI',
    objectName: 'WHSE_IMAGERY_AND_BASE_MAPS.MOT_ROAD_FEATURES_INVNTRY_SP'
  },
  {
    layerPickerLabel: 'PMBC Parcel Cadastre',
    objectName: 'WHSE_CADASTRE.PMBC_PARCEL_FABRIC_POLY_SVW'
  }
].sort((a, b) => (a.layerPickerLabel > b.layerPickerLabel ? -1 : 1));

export default mapLayers;
