import { TableCell, TableRow } from '@mui/material';
import React from 'react';

interface MonitoringColumn {
  id: 'monitoring_id' | 'inspection_date' | 'agency' | 'paper_file_id' | 'efficiency_rating' | 'general_comment';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

export const monitoringColumns: readonly MonitoringColumn[] = [
  { id: 'monitoring_id', label: 'Monitoring ID', minWidth: 150 },
  { id: 'inspection_date', label: 'Inspection Date', minWidth: 200 },
  { id: 'agency', label: 'Agency', minWidth: 200 },
  { id: 'paper_file_id', label: 'Paper File ID', minWidth: 200 },
  { id: 'efficiency_rating', label: 'Efficiency Rating', minWidth: 100 },
  { id: 'general_comment', label: 'General Comment (No data atm)', minWidth: 250 }
];

export const MonitoringRow = (props) => {
  const { row } = props;
  const [shortComment, setShortComment] = React.useState(true);

  const getValue = (value: any) => {
    if (value.length > 10) {
      if (shortComment) {
        return <>{value.substring(0, 10)}...</>;
      }
    }
    return <>{value}</>;
  };

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
              {/* Removed for now until we get monitoring comment {getValue(value)} */}
              {value}
            </TableCell>
          );
        })}
      </TableRow>
    </React.Fragment>
  );
};
