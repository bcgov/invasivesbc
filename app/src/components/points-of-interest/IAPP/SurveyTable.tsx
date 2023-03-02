import {
  Accordion,
  AccordionSummary,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography
} from '@mui/material';
import React from 'react';
import { getReportedAreaOutput } from './IAPP-Functions';

interface SurveyColumn {
  id:
    | 'survey_id'
    | 'invasive_plant_code'
    | 'species_common_name'
    | 'genus'
    | 'survey_date'
    | 'invasive_species_agency_code'
    | 'survey_paper_file_id'
    | 'surveyor_name'
    | 'reported_area'
    | 'density'
    | 'distribution'
    | 'general_comment';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

const surveyColumns: readonly SurveyColumn[] = [
  { id: 'survey_date', label: 'Survey Date', minWidth: 150 },
  { id: 'survey_paper_file_id', label: 'Survey Paper File ID', minWidth: 150 },
  { id: 'species_common_name', label: 'Invasive Plant', minWidth: 150 },
  { id: 'invasive_species_agency_code', label: 'Funding Agency', minWidth: 350 },
  { id: 'reported_area', label: 'Reported Area (ha)', minWidth: 150 },
  { id: 'density', label: 'Density', minWidth: 150 },
  { id: 'distribution', label: 'Distribution', minWidth: 350 },
  { id: 'surveyor_name', label: 'Surveyor Name', minWidth: 150 },
  { id: 'general_comment', label: 'General Comment', minWidth: 350 }
];

const sortArray = (inputArray: any[]) => {
  return [...inputArray].sort((a, b) => {
    if (a.survey_date.valueOf() > b.survey_date.valueOf()) {
      return 1;
    }
    if (a.survey_date.valueOf() < b.survey_date.valueOf()) {
      return -1;
    }
    return 0;
  });
};

const Row = (props: any) => {
  const { row } = props;
  const [shortComment, setShortComment] = React.useState(true);

  const shortValOutput = (value: string) => {
    if (shortComment) return <Typography fontSize={'1rem'}>{getShortVal(value)}</Typography>;
    else return <Typography fontSize={'1rem'}>{value}</Typography>;
  };

  const getShortVal = (value: string) => {
    if (value?.length < 35) return value;
    else return value.substring(0, 35) + '...';
  };

  const outputValue = (id: any, value: any) => {
    switch (id) {
      case 'general_comment':
        return shortValOutput(value as string);
      case 'reported_area':
        var returnVal;
        if ((value as number) > 0) {
          returnVal = value;
        } else returnVal = 'NWF';
        return <Typography fontSize={'1rem'}>{returnVal}</Typography>;
      default:
        return <Typography fontSize={'1rem'}>{value}</Typography>;
    }
  };

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' }, '&:last-child td, &:last-child th': { border: 0 } }}>
        {surveyColumns.map((column) => {
          const value = row[column.id];
          return (
            <TableCell
              key={column.id}
              align={column.align}
              onClick={() => {
                if (column.id === 'general_comment') setShortComment(!shortComment);
              }}>
              <Box>{outputValue(column.id, value)}</Box>
            </TableCell>
          );
        })}
      </TableRow>
    </React.Fragment>
  );
};

export const SurveysTable = (props: any) => {
  const { surveys } = props;
  const [expanded, setExpanded] = React.useState(true);
  const [rows, setRows] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  React.useEffect(() => {
    if (surveys?.length > 0) {
      const tempArr = [];
      surveys?.forEach((survey) => {
        tempArr.push(createData(survey));
      });
      setRows(sortArray(tempArr));
    }
  }, [surveys]);

  const SurveyTableHead = () => {
    return (surveyColumns as any).map((column) => (
      <TableCell align={column.align} style={{ minWidth: column.minWidth }} key={column.id}>
        <Typography fontSize={'1rem'}>{column.label}</Typography>
      </TableCell>
    ));
  };

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const createData = (survey: any) => {
    return {
      survey_id: survey.survey_id,
      invasive_plant_code: survey.invasive_plant_code,
      species_common_name: survey.common_name,
      genus: survey.genus,
      survey_date: survey.survey_date.substring(0, survey.survey_date.indexOf('T')),
      invasive_species_agency_code: survey.invasive_species_agency_code,
      reported_area: getReportedAreaOutput(survey.reported_area),
      survey_paper_file_id: survey.survey_paper_file_id,
      surveyor_name: survey.surveyor_name,
      density: survey.density,
      distribution: survey.distribution,
      general_comment: survey.general_comment
    };
  };

  return (
    <Accordion expanded={expanded} style={{ marginTop: 15, alignItems: 'center' }}>
      <AccordionSummary
        onClick={() => setExpanded(!expanded)}
        style={{ fontWeight: 'bold', fontSize: '1.125rem', marginLeft: 10, marginRight: 10 }}>
        Survey Details
      </AccordionSummary>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small" stickyHeader aria-lable="surveys table">
            <TableHead>
              <TableRow>
                <SurveyTableHead />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => (
                <Row key={row.survey_id} row={row} />
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          rowsPerPage={5}
          count={rows.length}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </Accordion>
  );
};
