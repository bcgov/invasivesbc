import { ActivityStatus } from "sharedAPI/src/constants";

export const getSearchCriteriaFromFilters = (
  advancedFilterRows: any,
  recordSets: any,
  setName: string,
  isIAPP: boolean,
  gridFilters: any,
  page: number,
  limit: number,
  sortColumns?: any[]
) => {
  const created_by_filter = advancedFilterRows?.filter((x) => x.filterField === 'created_by');
  const form_status_filter = advancedFilterRows?.filter((x) => x.filterField === 'record_status');
  const created_by = created_by_filter?.length === 1 ? created_by_filter[0].filterValue : null;
  const form_status = form_status_filter?.length === 1 ? form_status_filter[0].filterValue : ActivityStatus.SUBMITTED;
  let filter: any = {};
  if (created_by) {
    filter.created_by = [created_by];
  }
  if (form_status) {
    filter.form_status = [form_status];
  }
  /*if (props.subType) {
    filter.activity_subtype = [props.subType];
  } else if (props.formType) {
    filter.activity_type = [props.formType];
  }
  */
  filter.grid_filters = gridFilters;

  //search_feature
  if (recordSets[setName]?.searchBoundary && !recordSets[setName]?.searchBoundary?.server_id) {
    filter.search_feature = {
      type: 'FeatureCollection',
      features: recordSets[setName]?.searchBoundary.geos
    };
  }
  if (recordSets[setName]?.searchBoundary?.server_id) {
    filter.search_feature_server_id = recordSets[setName]?.searchBoundary?.server_id;
  }

  if (recordSets[setName]?.advancedFilters) {
    const currentAdvFilters = recordSets[setName]?.advancedFilters;
    const jurisdictions = [];
    const speciesPositive = [];
    const speciesNegative = [];
    currentAdvFilters.forEach((filter) => {
      switch (filter.filterField) {
        case 'Jurisdiction': {
          jurisdictions.push(Object.keys(filter.filterValue)[0]);
          break;
        }
        case 'Species Positive': {
          speciesPositive.push(Object.keys(filter.filterValue)[0]);
          break;
        }
        case 'Species Negative': {
          speciesNegative.push(Object.keys(filter.filterValue)[0]);
          break;
        }
      }

      if (filter.filterField === 'Species Positive') {
        speciesPositive.push(Object.keys(filter.filterValue)[0]);
      }
      if (filter.filterField === 'Species Negative') {
        speciesNegative.push(Object.keys(filter.filterValue)[0]);
      }
    });

    if (jurisdictions.length > 0) filter.jurisdiction = jurisdictions;
    if (speciesPositive.length > 0) filter.species_positive = speciesPositive;
    if (speciesNegative.length > 0) filter.species_negative = speciesNegative;
  }

  // is IAPP
  if (isIAPP) filter.isIAPP = isIAPP;

  // page number
  filter.page = page;

  // row limit
  filter.limit = limit;

  // column sorting
  if (sortColumns && sortColumns.length > 0) {
    filter.order = [...sortColumns];
  }
  return filter;
};
