import { TableCell, TableRow, Typography } from '@mui/material';
import React from 'react';

interface MonitoringColumn {
  id:
    | 'monitoring_id'
    | 'monitoring_date'
    | 'invasive_species_agency_code'
    | 'project_code'
    | 'primary_surveyor'
    | 'efficacy_rating'
    | 'general_comment';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

export const monitoringColumns: readonly MonitoringColumn[] = [
  { id: 'monitoring_date', label: 'Inspection Date', minWidth: 200 },
  { id: 'project_code', label: 'Paper File ID', minWidth: 100 },
  { id: 'invasive_species_agency_code', label: 'Funding Agency', minWidth: 100 },
  { id: 'efficacy_rating', label: 'Efficacy Rating', minWidth: 100 },
  { id: 'primary_surveyor', label: 'Primary Surveyor', minWidth: 100 }
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
