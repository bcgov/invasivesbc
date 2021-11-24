import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Collapse,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography
} from '@material-ui/core';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
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
            <TableCell style={{ fontWeight: 'bold' }}>Property Name</TableCell>
            <TableCell style={{ fontWeight: 'bold' }}>Value</TableCell>
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

  console.log(row, name);

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
                    <TableCell style={{ fontWeight: 'bold' }}>#</TableCell>
                    {Object.keys(row[0]).map((key) => {
                      return <TableCell style={{ fontWeight: 'bold' }}>{key}</TableCell>;
                    })}
                  </TableHead>
                  <TableBody>
                    {row.map((plant, index) => {
                      return (
                        <TableRow key={Math.random()}>
                          <TableCell>{index + 1}</TableCell>
                          {Object.keys(plant).map((key) => {
                            return (
                              <TableCell>
                                {Array.isArray(plant[key]) ? (
                                  <>
                                    {plant[key].map((herb, index) => {
                                      return (
                                        <Accordion>
                                          <AccordionSummary
                                            expandIcon={<ExpandMoreIcon />}
                                            aria-controls="panel1a-content"
                                            id="panel1a-header">
                                            <Typography>Herbicide #{index + 1}</Typography>
                                          </AccordionSummary>
                                          <AccordionDetails>
                                            <Typography>
                                              {Object.keys(herb).map((key) => {
                                                return (
                                                  <p>
                                                    <span style={{ fontWeight: 'bold' }}>{key}</span> : {herb[key]}
                                                  </p>
                                                );
                                              })}
                                            </Typography>
                                          </AccordionDetails>
                                        </Accordion>
                                      );
                                    })}
                                  </>
                                ) : typeof plant[key] === 'object' ? (
                                  <></>
                                ) : (
                                  `${plant[key]}`
                                )}
                              </TableCell>
                            );
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
