import React from 'react';
import { useSelector } from 'react-redux';
import { selectMap } from 'state/reducers/map';
import { selectUserSettings } from 'state/reducers/userSettings';
import './RecordTable.css';
import { getUnnestedFieldsForActivity } from './RecordTableHelpers';


export const RecordTableHeader = (props) => {
    
}

export const RecordTable = (props) => {
  const userSettingsState = useSelector(selectUserSettings);
  const mapAndRecordsState = useSelector(selectMap);
  const tableType = userSettingsState?.recordSets?.[props.setId]?.recordSetType;

  // maybe useful for when there's no headers during dev for adding new types:
  /*
  const unmappedColumns = mapAndRecordsState?.recordTables?.[props.setId]?.rows[0]
    ? Object.keys(mapAndRecordsState?.recordTables?.[props.setId]?.rows[0])
    : [];
   */

  const unmappedRows = mapAndRecordsState?.recordTables?.[props.setId]?.rows;

  const activityColumnsToDisplay = [
    {
      key: 'short_id',
      name: 'Activity ID',
      displayWidget: 'div'
    },
    {
      key: 'type',
      name: 'Activity Type'
    },
    {
      key: 'subtype',
      name: 'Activity Sub Type'
    },
    {
      key: 'activity_date',
      name: 'Activity Date'
    },
    {
      key: 'project_code',
      name: 'Project Code'
    },
    {
      key: 'jurisdiction',
      name: 'Jurisdiction'
    },
    {
      key: 'species_positive',
      name: 'All Positive'
    },
    {
      key: 'species_negative',
      name: 'All Negative'
    },
    {
      key: 'has_current_positive',
      name: 'Has Current Positive'
    },
    {
      key: 'current_positive',
      name: 'Current Positive Species'
    },
    {
      key: 'has_current_negative',
      name: 'Has Current Negative'
    },
    {
      key: 'current_negative',
      name: 'Current Negative Species'
    },
    {
      key: 'species_treated',
      name: 'Species Treated'
    },
    { key: 'created_by', name: 'Created By' },
    { key: 'updated_by', name: 'Updated By' },
    {
      key: 'agency',
      name: 'Agency'
    },
    {
      key: 'regional_invasive_species_organization_areas',
      name: 'Regional Invasive Species Organization Areas'
    },
    {
      key: 'regional_districts',
      name: 'Regional Districts'
    },
    {
      key: 'biogeoclimatic_zones',
      name: 'Bio Geo Climatic Zones'
    },
    {
      key: 'elevation',
      name: 'Elevation'
    },
    {
      key: 'batch_id',
      name: 'Batch ID'
    }
  ];

  const mappedRows = unmappedRows?.map((row) => {
    let unnestedRow = getUnnestedFieldsForActivity(row); 
    let mappedRow = {};
    Object.keys(unnestedRow).forEach((key) => {
        mappedRow[key] = unnestedRow[key];
      }
    )
    return mappedRow;
  });

  return (
    <div className="record_table_container">
      <table className="record_table">
        <tr className="record_table_header">
          {activityColumnsToDisplay.map((col: any, i) => {
            return (
              <th
                className="record_table_header_column"
                key={i}>
                {col.name}
              </th>
            );
          })}
        </tr>
        {mappedRows?.map((row, i) => {
          return (
            <tr className="record_table_row" key={i}>
              {activityColumnsToDisplay.map((col, j) => {
                return (
                  <td className="record_table_row_column" key={j}>
                    {JSON.stringify(row[col.key])}
                  </td>
                );
              })}
            </tr>
          );
        })}
      </table>
    </div>
  );
};
