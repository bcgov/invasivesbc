import { TableCell, TableRow, Typography } from '@mui/material';
import React from 'react';

// add ALL monitoring columns here (from each MonitoringColumn[] array)
interface MonitoringColumn {
  id:
    | 'monitoring_id'
    | 'monitoring_date'
    | 'invasive_species_agency_code'
    | 'project_code'
    | 'primary_surveyor'
    | 'efficacy_rating'
    | 'general_comment'
    | 'biological_agent_code'
    | 'agent_count'
    | 'plant_count'
    | 'count_duration'
    | 'legacy_presence'
    | 'foliar_feeding_damage_ind'
    | 'root_feeding_damage_ind'
    | 'seed_feeding_damage_ind'
    | 'oviposition_marks_ind'
    | 'eggs_present_ind'
    | 'pupae_present_ind'
    | 'adults_present_ind'
    | 'tunnels_present_ind'
    | 'monitoring_comments'
    | 'entered_by'
    | 'date_entered'
    | 'updated_by'
    | 'date_updated';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

export const defaultMonitoringColumns: readonly MonitoringColumn[] = [
  { id: 'monitoring_date', label: 'Inspection Date', minWidth: 200 },
  { id: 'project_code', label: 'Paper File ID', minWidth: 100 },
  { id: 'invasive_species_agency_code', label: 'Funding Agency', minWidth: 100 },
  { id: 'efficacy_rating', label: 'Efficacy Rating', minWidth: 100 },
  { id: 'primary_surveyor', label: 'Primary Surveyor', minWidth: 100 },
  { id: 'monitoring_comments', label: 'Monitoring Comments', minWidth: 350 },
  { id: 'entered_by', label: 'Entered By', minWidth: 100 },
  { id: 'date_entered', label: 'Date Entered', minWidth: 150 },
  { id: 'updated_by', label: 'Updated By', minWidth: 100 },
  { id: 'date_updated', label: 'Date Updated', minWidth: 150 }
];

// add other ones and rename this if needed
export const customMonitoringColumns: readonly MonitoringColumn[] = [
  { id: 'monitoring_date', label: 'Inspection Date', minWidth: 200 },
  { id: 'project_code', label: 'Monitoring Paper File ID', minWidth: 100 },
  { id: 'invasive_species_agency_code', label: 'Funding Agency', minWidth: 100 },
  { id: 'primary_surveyor', label: 'Primary Surveyor', minWidth: 100 },
  { id: 'biological_agent_code', label: 'Biological Agent', minWidth: 100 },
  { id: 'agent_count', label: 'Agent Count', minWidth: 100 },
  { id: 'plant_count', label: 'Plant Count', minWidth: 100 },
  { id: 'count_duration', label: 'Count Duration (min)', minWidth: 100 },
  { id: 'legacy_presence', label: 'Legacy Presence', minWidth: 100 },
  { id: 'foliar_feeding_damage_ind', label: 'Foliar Feeding Damage', minWidth: 100 },
  { id: 'root_feeding_damage_ind', label: 'Root Feeding Damage', minWidth: 100 },
  { id: 'seed_feeding_damage_ind', label: 'Seed Feeding Damage', minWidth: 100 },
  { id: 'oviposition_marks_ind', label: 'Oviposition Marks', minWidth: 100 },
  { id: 'eggs_present_ind', label: 'Eggs Present', minWidth: 100 },
  { id: 'pupae_present_ind', label: 'Pupae Present', minWidth: 100 },
  { id: 'adults_present_ind', label: 'Adults Present', minWidth: 100 },
  { id: 'tunnels_present_ind', label: 'Tunnels Present', minWidth: 100 },
  { id: 'monitoring_comments', label: 'Monitoring Comments', minWidth: 350 },
  { id: 'entered_by', label: 'Entered By', minWidth: 100 },
  { id: 'date_entered', label: 'Date Entered', minWidth: 150 },
  { id: 'updated_by', label: 'Updated By', minWidth: 100 },
  { id: 'date_updated', label: 'Date Updated', minWidth: 150 }
];

export const MonitoringRow = (props) => {
  const { row } = props;
  const [shortComment, setShortComment] = React.useState(true);

  // const getValue = (value: any) => {
  //   if (value.length > 10) {
  //     if (shortComment) {
  //       return <>{value.substring(0, 10)}...</>;
  //     }
  //   }
  //   return <>{value}</>;
  // };

  //update this switch if we have more column sets for monitoring
  var monitoringColumns;
  switch (props.type) {
    case 'Mechanical Treatment':
      monitoringColumns = defaultMonitoringColumns;
      break;
    case 'Chemical Treatment':
      monitoringColumns = defaultMonitoringColumns;
      break;
    case 'Biological Dispersal':
      monitoringColumns = customMonitoringColumns;

      break;
    case 'Biological Treatment':
      monitoringColumns = customMonitoringColumns;
      break;
    default:
      monitoringColumns = defaultMonitoringColumns;
  }
  return (
    <React.Fragment>
      <TableRow tabIndex={-1} key={row.monitoring_id}>
        {monitoringColumns.map((column) => {
          const value = row[column.id];
          return (
            <TableCell
              key={column.id}
              align={column.align}
              onClick={() => {
                if (column.id === 'general_comment') {
                  setShortComment(!shortComment);
                }
              }}>
              <>{/* Removed for now until we get monitoring comment {getValue(value)} */}</>
              <Typography fontSize={'0.875rem'}>{value}</Typography>
            </TableCell>
          );
        })}
      </TableRow>
    </React.Fragment>
  );
};
