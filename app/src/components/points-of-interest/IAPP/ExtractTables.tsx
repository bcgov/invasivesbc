import {
  Accordion,
  AccordionSummary,
  Box,
  Collapse,
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
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { monitoringColumns, MonitoringRow } from './MonitoringTable';

interface TreatmentColumn {
  id:
    | 'treatment_id'
    | 'species_common_name'
    | 'treatment_date'
    | 'invasive_species_agency_code'
    | 'reported_area'
    | 'method_code'
    | 'project_code'
    | 'general_comment';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

const treatmentColumns: readonly TreatmentColumn[] = [
  { id: 'treatment_id', label: 'Treatment ID', minWidth: 150 },
  { id: 'species_common_name', label: 'Common Name', minWidth: 150 },
  { id: 'treatment_date', label: 'Treatment Date', minWidth: 150 },
  { id: 'invasive_species_agency_code', label: 'Invasive Species Agency Code', minWidth: 230 },
  { id: 'reported_area', label: 'Reported Area', minWidth: 150 },
  { id: 'method_code', label: 'Mehtod Code', minWidth: 150 },
  { id: 'project_code', label: 'Project Code', minWidth: 150 },
  { id: 'general_comment', label: 'General Comment', minWidth: 250 }
];

interface BioDispersalColumn {
  id:
    | 'dispersal_id'
    | 'species_common_name'
    | 'inspection_date'
    | 'project_code'
    | 'plant_count'
    | 'agent_count'
    | 'biological_agent_code'
    | 'foliar_feeding_damage_ind'
    | 'root_feeding_damage_ind'
    | 'seed_feeding_damage_ind'
    | 'oviposition_marks_ind'
    | 'eggs_present_ind'
    | 'pupae_present_ind'
    | 'adults_present_ind'
    | 'tunnels_present_ind'
    | 'general_comment';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

const bioDispersalColumns: readonly BioDispersalColumn[] = [
  { id: 'dispersal_id', label: 'Dispersal ID', minWidth: 150 },
  { id: 'species_common_name', label: 'Common Name', minWidth: 150 },
  { id: 'inspection_date', label: 'Inspection Date', minWidth: 150 },
  { id: 'project_code', label: 'Project Code', minWidth: 150 },
  { id: 'plant_count', label: 'Plant Count', minWidth: 150 },
  { id: 'agent_count', label: 'Agent Count', minWidth: 150 },
  { id: 'biological_agent_code', label: 'Agent Code', minWidth: 150 },
  { id: 'foliar_feeding_damage_ind', label: 'Foliar Feeding Damage', minWidth: 150 },
  { id: 'root_feeding_damage_ind', label: 'Root Feeding damage', minWidth: 150 },
  { id: 'seed_feeding_damage_ind', label: 'Seed Feeding Damage', minWidth: 150 },
  { id: 'oviposition_marks_ind', label: 'Oviposition Marks', minWidth: 150 },
  { id: 'eggs_present_ind', label: 'Eggs Present', minWidth: 150 },
  { id: 'pupae_present_ind', label: 'Pupae Present', minWidth: 150 },
  { id: 'adults_present_ind', label: 'Adults Present', minWidth: 150 },
  { id: 'tunnels_present_ind', label: 'Tunnels Present', minWidth: 150 },
  { id: 'general_comment', label: 'General_comment', minWidth: 250 }
];

interface BioTreatmentColumn {
  id:
    | 'treatment_id'
    | 'species_common_name'
    | 'treatment_date'
    | 'collection_date'
    | 'invasive_species_agency_code'
    | 'classified_area_code'
    | 'biological_agent_code'
    | 'bioagent_source'
    | 'biological_agent_stage_code'
    | 'agent_source'
    | 'release_quantity'
    | 'project_code'
    | 'general_comment';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

const bioTreatmentColumns: readonly BioTreatmentColumn[] = [
  { id: 'treatment_id', label: 'Treatment ID', minWidth: 150 },
  { id: 'species_common_name', label: 'Common Name', minWidth: 150 },
  { id: 'treatment_date', label: 'Treatment Date', minWidth: 150 },
  { id: 'collection_date', label: 'Collection Date', minWidth: 150 },
  { id: 'invasive_species_agency_code', label: 'Invasive Species Agency Code', minWidth: 150 },
  { id: 'classified_area_code', label: 'Classified Area Code', minWidth: 150 },
  { id: 'biological_agent_code', label: 'Biological Agent Code', minWidth: 150 },
  { id: 'bioagent_source', label: 'Bioagent Source', minWidth: 150 },
  { id: 'biological_agent_stage_code', label: 'Biological Agent Stage Code', minWidth: 150 },
  { id: 'agent_source', label: 'Agent Source', minWidth: 150 },
  { id: 'release_quantity', label: 'Release Quantity', minWidth: 150 },
  { id: 'project_code', label: 'Project Code', minWidth: 150 },
  { id: 'general_comment', label: 'General Comment', minWidth: 250 }
];

const Row = (props) => {
  const { row, type } = props;
  const [monitoringRows, setMonitoringRows] = React.useState([]);
  const [open, setOpen] = React.useState(false);
  const [shortComment, setShortComment] = React.useState(true);

  React.useEffect(() => {
    if (row.monitoring?.length > 0) {
      const tempArr = [];
      row.monitoring.map((item) => {
        tempArr.push(convertData(item));
      });
      setMonitoringRows(tempArr);
    }
  });

  const shortValOutput = (value: string) => {
    if (shortComment) return <>{getShortVal(value)}</>;
    else return <>{value}</>;
  };

  const getShortVal = (value: string) => {
    if (value.length < 10) return value;
    else return value.substring(0, 10) + '...';
  };

  const convertData = (item: any) => {
    return {
      monitoring_id: item.monitoring_id,
      inspection_date: item.monitoring_date,
      agency: item.invasive_species_agency_code,
      paper_file_id: item?.project_code[0]?.description,
      efficiency_rating: item.efficiency_percent
    };
  };

  const ExtractRow = () => {
    var columnsObj;

    switch (type) {
      case 'Biological Dispersal':
        columnsObj = bioDispersalColumns;
        break;
      case 'Biological Treatment':
        columnsObj = bioTreatmentColumns;
        break;
      default:
        columnsObj = treatmentColumns;
    }

    return columnsObj.map((column) => {
      const value = row[column.id];
      return (
        <TableCell
          size="small"
          key={column.id}
          align={column.align}
          style={{ height: 80 }}
          onClick={() => {
            if (column.id === 'general_comment') setShortComment(!shortComment);
          }}>
          <Box>{column.id !== 'general_comment' ? <>{value}</> : shortValOutput(value)}</Box>
        </TableCell>
      );
    });
  };

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <ExtractRow />
      </TableRow>
      <TableRow>
        <TableCell size="small" style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography>Monitoring</Typography>
              <Table size="small" aria-label="monitoring">
                <TableHead>
                  <TableRow>
                    {monitoringColumns.map((column) => (
                      <TableCell align={column.align} style={{ minWidth: column.minWidth }} key={column.id}>
                        {column.label}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {monitoringRows.map((item) => {
                    return <MonitoringRow row={item} />;
                  })}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

export const TreatmentsTable = (props) => {
  const { type, treatments } = props;
  const [rows, setRows] = React.useState([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  React.useEffect(() => {
    if (treatments.length > 0) {
      const tempArr = [];
      treatments.forEach((treatment) => {
        tempArr.push(createData(treatment));
      });
      setRows(tempArr);
    }
  }, [treatments]);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value);
    setPage(0);
  };

  const createData = (treatment: any) => {
    var method_code;
    var returnObj;
    switch (type) {
      case 'Mechanical':
        method_code = treatment.mechanical_method_code;
        break;
      case 'Chemical':
        method_code = treatment.chemical_method_code;
        break;
      default:
        method_code = null;
    }

    switch (type) {
      case 'Biological Dispersal':
        returnObj = {
          dispersal_id: treatment.biological_dispersal_id,
          species_common_name: treatment.common_name,
          inspection_date: treatment.monitoring_date,
          project_code: treatment?.project_code[0]?.description,
          plant_count: treatment.plant_count,
          agent_count: treatment.agent_count,
          biological_agent_code: treatment.biological_agent_code,
          foliar_feeding_damage_ind: treatment.foliar_feeding_damage_ind,
          root_feeding_damage_ind: treatment.root_feeding_damage_ind,
          seed_feeding_damage_ind: treatment.seed_feeding_damage_ind,
          oviposition_marks_ind: treatment.oviposition_marks_ind,
          eggs_present_ind: treatment.eggs_present_ind,
          pupae_present_ind: treatment.pupae_present_ind,
          adults_present_ind: treatment.adults_present_ind,
          tunnels_present_ind: treatment.tunnels_present_ind,
          general_comment: treatment.general_comment
        };
        break;
      case 'Biological Treatment':
        returnObj = {
          treatment_id: treatment.treatment_id,
          species_common_name: treatment.common_name,
          treatment_date: treatment.treatment_date,
          invasive_species_agency_code: treatment.invasive_species_agency_code,
          collection_date: treatment.collection_date,
          classified_area_code: treatment.classified_area_code,
          biological_agent_code: treatment.biological_agent_code,
          bioagent_source: treatment.bioagent_source,
          biological_agent_stage_code: treatment.biological_agent_stage_code,
          agent_source: treatment.agent_source,
          release_quantity: treatment.release_quantity,
          project_code: treatment?.project_code[0]?.description,
          general_comment: treatment.general_comment
        };
        break;
      default:
        returnObj = {
          treatment_id: treatment.treatment_id,
          species_common_name: treatment.common_name,
          treatment_date: treatment.treatment_date,
          invasive_species_agency_code: treatment.invasive_species_agency_code,
          reported_area: treatment.reported_area,
          method_code: method_code,
          project_code: treatment?.project_code[0]?.description,
          general_comment: treatment.general_comment,
          monitoring: treatment.monitoring
        };
    }

    return returnObj;
  };

  const TreatmentTableHead = () => {
    var columnsObj;
    switch (type) {
      case 'Biological Dispersal':
        columnsObj = bioDispersalColumns;
        break;
      case 'Biological Treatment':
        columnsObj = bioTreatmentColumns;
        break;
      default:
        columnsObj = treatmentColumns;
    }
    return columnsObj.map((column) => (
      <TableCell align={column.align} style={{ minWidth: column.minWidth }} key={column.id}>
        {column.label}
      </TableCell>
    ));
  };

  return (
    <Accordion style={{ marginTop: 15, alignItems: 'center' }}>
      <AccordionSummary style={{ fontSize: '1.125rem', marginLeft: 10, marginRight: 10 }}>
        {type} {type === 'Mechanical' || type === 'Chemical' ? <>Treatment</> : null}
      </AccordionSummary>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table stickyHeader aria-label="treatments table">
            <TableHead>
              <TableRow>
                <TreatmentTableHead />
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row) => {
                if (row.treatment_id) return <Row key={row.treatment_id} row={row} type={type} />;
                else return <Row key={row.dispersal_id} row={row} type={type} />;
              })}
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
