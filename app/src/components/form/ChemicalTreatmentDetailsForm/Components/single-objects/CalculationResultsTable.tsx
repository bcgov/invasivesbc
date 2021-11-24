import {
  Box,
  Collapse,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@material-ui/core';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import React from 'react';

const CalculationResultsTable = ({ data }) => {
  return (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Property Name</TableCell>
            <TableCell>Value</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {/* {rows.map((row) => (
            <Row key={row.name} row={row} />
          ))} */}

          {Object.keys(data).map((key) => {
            return <Row key={key} name={key} row={data[key]} />;
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

function createData(name: string, value: number) {
  return {
    name,
    value,
    history: [
      {
        date: '2020-01-05',
        customerId: '11091700',
        amount: 3
      },
      {
        date: '2020-01-02',
        customerId: 'Anonymous',
        amount: 1
      }
    ]
  };
}

function Row(props: { name: string; row: ReturnType<typeof createData> }) {
  const { row, name } = props;
  const [open, setOpen] = React.useState(false);

  return (
    <React.Fragment>
      <TableRow>
        <TableCell>
          <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
            {!Array.isArray(row) ? <></> : open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell component="th" scope="row">
          <p>{name}</p>
        </TableCell>
        <TableCell>{Array.isArray(row) ? '' : row}</TableCell>
      </TableRow>

      {Array.isArray(row) && (
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box sx={{ margin: 1 }}>
                <Table size="medium" aria-label="purchases">
                  <TableHead>
                    <TableRow>
                      <TableCell>#</TableCell>
                      {Object.keys(row[0]).map((key) => {
                        return <TableCell>{key}</TableCell>;
                      })}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {row.map((plant, index) => {
                      return (
                        <TableRow key={Math.random()}>
                          <TableCell>{index + 1}</TableCell>
                          {Object.keys(plant).map((key) => {
                            return <TableCell>{plant[key]}</TableCell>;
                          })}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Box>
            </Collapse>
          </TableCell>
        </TableRow>
      )}
    </React.Fragment>
  );
}

export default CalculationResultsTable;
