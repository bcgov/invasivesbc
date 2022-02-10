import {
  Accordion,
  AccordionSummary,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
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
  { id: 'survey_id', label: 'Survey ID', minWidth: 150 },
  { id: 'invasive_plant_code', label: 'Invasive Plant Code', minWidth: 150 },
  { id: 'species_common_name', label: 'Common Name', minWidth: 150 },
  { id: 'genus', label: 'Genus', minWidth: 150 },
  { id: 'survey_date', label: 'Survey Date', minWidth: 150 },
  { id: 'invasive_species_agency_code', label: 'Invasive Species Agency Code', minWidth: 150 },
  { id: 'reported_area', label: 'Reported Area', minWidth: 150 },
  { id: 'density', label: 'Density', minWidth: 150 },
  { id: 'distribution', label: 'Distribution', minWidth: 150 },
  { id: 'general_comment', label: 'General Comment', minWidth: 250 }
];

export const SurveysTable = (props: any) => {
  const { surveys } = props;
  const [rows, setRows] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  React.useEffect(() => {
    if (surveys.length > 0) {
      const tempArr = [];
      surveys.forEach((survey) => {
        tempArr.push(createData(survey));
      });
      setRows(tempArr);
    }
  }, [surveys]);

  const SurveyTableHead = () => {
    return (surveyColumns as any).map((column) => (
      <TableCell align={column.align} style={{ minWidth: column.minWidth }} key={column.id}>
        <>{column.label}</>
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
      survey_date: survey.survey_date,
      invasive_species_agency_code: survey.invasive_species_agency_code,
      reported_area: getReportedAreaOutput(survey.reported_area),
      density: survey.density,
      distribution: survey.distribution,
      general_comment: survey.general_comment
    };
  };

  return (
    <Accordion style={{ marginTop: 15, alignItems: 'center' }}>
      <AccordionSummary style={{ fontSize: '1.125rem', marginLeft: 10, marginRight: 10 }}>
        Survey Details
      </AccordionSummary>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader aria-lable="surveys table">
            <TableHead>
              <TableRow>
                <SurveyTableHead />
              </TableRow>
            </TableHead>
            <TableBody></TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Accordion>
  );
};
