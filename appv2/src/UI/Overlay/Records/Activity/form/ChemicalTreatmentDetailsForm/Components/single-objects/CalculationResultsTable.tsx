import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
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
} from '@mui/material';
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
    value
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
          <p>
            {name
              .toString()
              .replace(/_/g, ' ')
              .split(' ')
              .map((word) => {
                return word[0].toUpperCase() + word.substr(1);
              })
              .join(' ')}
          </p>
        </TableCell>
        <TableCell>
          <span style={{ color: name.toString().toLowerCase().includes('percent') && Number(row) > 100 && 'red' }}>
            {Array.isArray(row) ? '' : name.toString().toLowerCase().includes('percent') ? row.toString() + '%' : row}
          </span>
        </TableCell>
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
                      if (key === 'index') return <></>;
                      return (
                        <TableCell key={key} style={{ fontWeight: 'bold' }}>
                          {key
                            .toString()
                            .replace(/_/g, ' ')
                            .split(' ')
                            .map((word) => {
                              return word[0].toUpperCase() + word.substr(1);
                            })
                            .join(' ')}
                        </TableCell>
                      );
                    })}
                  </TableHead>
                  <TableBody>
                    {row.map((plant, index) => {
                      return (
                        <TableRow key={Math.random()}>
                          <TableCell>{index + 1}</TableCell>
                          {Object.keys(plant).map((key) => {
                            if (key === 'index') return <></>;
                            return (
                              <TableCell key={key}>
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
                                                  <p key={key}>
                                                    <span style={{ fontWeight: 'bold' }}>
                                                      {key
                                                        .toString()
                                                        .replace(/_/g, ' ')
                                                        .split(' ')
                                                        .map((word) => {
                                                          return word[0].toUpperCase() + word.substr(1);
                                                        })
                                                        .join(' ')}
                                                    </span>{' '}
                                                    :{' '}
                                                    {key.toUpperCase().includes('PERCENT')
                                                      ? herb[key] + '%'
                                                      : herb[key]}
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
                                  `${key.toUpperCase().includes('PERCENT') ? plant[key] + '%' : plant[key]}`
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
