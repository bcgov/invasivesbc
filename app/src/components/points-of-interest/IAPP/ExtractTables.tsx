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

interface MechTreatmentColumn {
  id:
    | 'treatment_id'
    | 'species_common_name'
    | 'treatment_date'
    | 'invasive_species_agency_code'
    | 'employer'
    | 'primary_applicator'
    | 'reported_area'
    | 'mechanical_method'
    | 'project_code'
    | 'general_comment';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

interface ChemTreatmentColumn {
  id:
    | 'treatment_id'
    | 'species_common_name'
    | 'employer'
    | 'amount_of_mix'
    | 'herbicide_amount'
    | 'herbicide'
    | 'application_rate'
    | 'mix_delivery_rate'
    | 'dilution'
    | 'tank_mix'
    | 'service_licence_number'
    | 'pmp_confirmation_number'
    | 'treatment_date'
    | 'primary_applicator'
    | 'invasive_species_agency_code'
    | 'reported_area'
    | 'chemical_method'
    | 'project_code'
    | 'general_comment';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

interface BioDispersalColumn {
  id:
    | 'dispersal_id'
    | 'species_common_name'
    | 'inspection_date'
    | 'project_code'
    | 'duration_of_count'
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

interface BioTreatmentColumn {
  id:
    | 'treatment_id'
    | 'species_common_name'
    | 'treatment_date'
    | 'collection_date'
    | 'invasive_species_agency_code'
    | 'employer'
    | 'primary_applicator'
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

const mechTreatmentColumns: readonly MechTreatmentColumn[] = [
  { id: 'treatment_date', label: 'Treatment Date', minWidth: 150 },
  { id: 'project_code', label: 'Paper File ID', minWidth: 150 },
  { id: 'species_common_name', label: 'Invasive Plant', minWidth: 150 },
  { id: 'invasive_species_agency_code', label: 'Treatment Agency', minWidth: 350 },
  { id: 'employer', label: 'Employer', minWidth: 150 },
  { id: 'primary_applicator', label: 'Primary Applicator', minWidth: 150 },
  { id: 'reported_area', label: 'Treated Area', minWidth: 150 },
  { id: 'mechanical_method', label: 'Method', minWidth: 150 },
  { id: 'general_comment', label: 'General Comment', minWidth: 350 }
];

const chemTreatmentColumns: readonly ChemTreatmentColumn[] = [
  { id: 'treatment_date', label: 'Treatment Date', minWidth: 150 },
  { id: 'project_code', label: 'Paper File ID', minWidth: 150 },
  { id: 'species_common_name', label: 'Invasive Plant', minWidth: 150 },
  { id: 'pmp_confirmation_number', label: 'PMP Confirmation', minWidth: 150 },
  { id: 'service_licence_number', label: 'Service Licence Number', minWidth: 150 },
  { id: 'invasive_species_agency_code', label: 'Treatment Agency', minWidth: 350 },
  { id: 'employer', label: 'Employer', minWidth: 150 },
  { id: 'primary_applicator', label: 'Primary Applicator', minWidth: 350 },
  { id: 'chemical_method', label: 'Method', minWidth: 150 },
  { id: 'herbicide', label: 'Herbicide', minWidth: 150 },
  { id: 'reported_area', label: 'Treated Area (ha)', minWidth: 150 },
  { id: 'application_rate', label: 'Product Application Rate', minWidth: 150 },
  { id: 'amount_of_mix', label: 'Amount of Mix Used (L)', minWidth: 150 },
  { id: 'dilution', label: 'Dilution (%)', minWidth: 150 },
  { id: 'mix_delivery_rate', label: 'Delivery Rate of Mix', minWidth: 150 },
  { id: 'herbicide_amount', label: 'Amount of Undiluted Herbicide Used (L)', minWidth: 150 },
  { id: 'tank_mix', label: 'Tank Mix', minWidth: 150 },
  { id: 'general_comment', label: 'Treatment Comment', minWidth: 350 }
];

const bioDispersalColumns: readonly BioDispersalColumn[] = [
  { id: 'inspection_date', label: 'Inspection Date', minWidth: 150 },
  { id: 'project_code', label: 'Paper File ID', minWidth: 350 },
  { id: 'species_common_name', label: 'Invasive Plant', minWidth: 200 },
  { id: 'duration_of_count', label: 'Duration of Count (min)', minWidth: 150 },
  { id: 'plant_count', label: 'Plant Count', minWidth: 150 },
  { id: 'agent_count', label: 'Agent Count', minWidth: 150 },
  { id: 'biological_agent_code', label: 'Biological Agent', minWidth: 150 },
  { id: 'foliar_feeding_damage_ind', label: 'Foliar Feeding Damage', minWidth: 150 },
  { id: 'root_feeding_damage_ind', label: 'Root Feeding damage', minWidth: 150 },
  { id: 'seed_feeding_damage_ind', label: 'Seed Feeding Damage', minWidth: 150 },
  { id: 'oviposition_marks_ind', label: 'Oviposition Marks', minWidth: 150 },
  { id: 'eggs_present_ind', label: 'Eggs Present', minWidth: 150 },
  { id: 'pupae_present_ind', label: 'Pupae Present', minWidth: 150 },
  { id: 'adults_present_ind', label: 'Adults Present', minWidth: 150 },
  { id: 'tunnels_present_ind', label: 'Tunnels Present', minWidth: 150 },
  { id: 'general_comment', label: 'Comments', minWidth: 350 }
];

const bioTreatmentColumns: readonly BioTreatmentColumn[] = [
  { id: 'treatment_date', label: 'Treatment Date', minWidth: 150 },
  { id: 'project_code', label: 'Paper File ID', minWidth: 150 },
  { id: 'species_common_name', label: 'Common Name', minWidth: 200 },
  { id: 'invasive_species_agency_code', label: 'Treatment Agency', minWidth: 350 },
  { id: 'employer', label: 'Employer', minWidth: 150 },
  { id: 'primary_applicator', label: 'Primary Applicator', minWidth: 150 },
  { id: 'biological_agent_code', label: 'Biological Agent', minWidth: 150 },
  { id: 'agent_source', label: 'Agent Source', minWidth: 150 },
  { id: 'release_quantity', label: 'Release Quantity', minWidth: 150 },
  { id: 'general_comment', label: 'General Comment', minWidth: 350 }
];

const Row = (props: any) => {
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
  }, [row]);

  const shortValOutput = (value: string) => {
    if (shortComment) return <Typography fontSize={'1rem'}>{getShortVal(value)}</Typography>;
    else return <Typography fontSize={'1rem'}>{value}</Typography>;
  };

  const getShortVal = (value: string) => {
    if (value?.length < 35) return value;
    else return value.substring(0, 35) + '...';
  };

  const convertData = (item: any) => {
    return {
      monitoring_id: item.monitoring_id,
      monitoring_date: item.monitoring_date.substring(0, item.monitoring_date.indexOf('T')),
      invasive_species_agency_code: item.invasive_species_agency_code,
      project_code: item.project_code,
      primary_surveyor: item.primary_surveyor,
      efficacy_rating: item.efficacy_code
    };
  };

  const ExtractRow = () => {
    var columnsObj;

    switch (type) {
      case 'Mechanical Treatment':
        columnsObj = mechTreatmentColumns;
        break;
      case 'Chemical Treatment':
        columnsObj = chemTreatmentColumns;
        break;
      case 'Biological Dispersal':
        columnsObj = bioDispersalColumns;
        break;
      case 'Biological Treatment':
        columnsObj = bioTreatmentColumns;
        break;
      default:
    }

    return columnsObj.map((column) => {
      const value = row[column.id];
      return (
        <TableCell
          size="small"
          key={column.id}
          align={column.align}
          style={{ fontSize: '1rem' }}
          onClick={() => {
            if (column.id === 'general_comment') {
              setShortComment(!shortComment);
            }
            if (column.id === 'treatment_date') {
              setOpen(!open);
            }
          }}>
          {monitoringRows.length > 0 && column.id === 'treatment_date' && (
            <>{open ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}</>
          )}
          {column.id !== 'general_comment' ? <>{value}</> : shortValOutput(value)}
        </TableCell>
      );
    });
  };

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' }, '&:last-child td, &:last-child th': { border: 0 } }}>
        <ExtractRow />
      </TableRow>
      {monitoringRows && (
        <TableRow>
          <TableCell padding="none" colSpan={18}>
            <Collapse in={open} timeout="auto" unmountOnExit>
              <Box margin={1} marginLeft={5}>
                <Typography fontSize={'0.925rem'}>Monitoring Table</Typography>
                <Table size="small" aria-label="monitoring">
                  <TableHead>
                    <TableRow
                      sx={{ '& > *': { borderBottom: 'unset' }, '&:last-child td, &:last-child th': { border: 0 } }}>
                      {monitoringColumns.map((column) => (
                        <TableCell align={column.align} colSpan={1} key={column.id}>
                          <Typography fontSize={'0.875rem'}>{column.label}</Typography>
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
      )}
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
      case 'Mechanical Treatment':
        returnObj = {
          treatment_id: treatment.treatment_id,
          species_common_name: treatment.common_name,
          treatment_date: treatment.treatment_date.substring(0, treatment.treatment_date.indexOf('T')),
          invasive_species_agency_code: treatment.invasive_species_agency_code,
          reported_area: treatment.reported_area,
          method_code: method_code,
          project_code: treatment?.project_code[0]?.description,
          general_comment: treatment.general_comment,
          monitoring: treatment.monitoring
        };
        break;
      case 'Chemical Treatment':
        returnObj = {
          treatment_id: treatment.treatment_id,
          species_common_name: treatment.common_name,
          project_code: treatment?.project_code[0]?.description,
          treatment_date: treatment.treatment_date.substring(0, treatment.treatment_date.indexOf('T')),
          pmp_confirmation_number: treatment.pmp_confirmation_number,
          service_licence_number: treatment.service_licence_number,
          invasive_species_agency_code: treatment.invasive_species_agency_code,
          employer: treatment.employer,
          primary_applicator: treatment.primary_applicator,
          chemical_method: treatment.chemical_method,
          herbicide: treatment.herbicide,
          reported_area: treatment.reported_area,
          application_rate: treatment.application_rate,
          amount_of_mix: treatment.amount_of_mix,
          dilution: treatment.dilution,
          mix_delivery_rate: treatment.mix_delivery_rate,
          herbicide_amount: treatment.herbicide_amount,
          tank_mix: treatment.tank_mix,
          general_comment: treatment.general_comment,
          monitoring: treatment.monitoring
        };
        break;
      case 'Biological Dispersal':
        returnObj = {
          dispersal_id: treatment.biological_dispersal_id,
          species_common_name: treatment.common_name,
          inspection_date: treatment.monitoring_date.substring(0, treatment.monitoring_date.indexOf('T')),
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
          treatment_date: treatment.treatment_date.substring(0, treatment.treatment_date.indexOf('T')),
          invasive_species_agency_code: treatment.invasive_species_agency_code,
          employer: treatment.employer,
          primary_applicator: treatment.primary_applicator,
          collection_date: treatment.collection_date,
          classified_area_code: treatment.classified_area_code,
          biological_agent_code: treatment.biological_agent_code,
          agent_source: treatment.agent_source,
          biological_agent_stage_code: treatment.biological_agent_stage_code,
          release_quantity: treatment.release_quantity,
          project_code: treatment?.project_code[0]?.description,
          general_comment: treatment.general_comment,
          monitoring: treatment.monitoring
        };
        break;
      default:
    }

    return returnObj;
  };

  const TreatmentTableHead = () => {
    var columnsObj;
    switch (type) {
      case 'Mechanical Treatment':
        columnsObj = mechTreatmentColumns;
        break;
      case 'Chemical Treatment':
        columnsObj = chemTreatmentColumns;
        break;
      case 'Biological Dispersal':
        columnsObj = bioDispersalColumns;
        break;
      case 'Biological Treatment':
        columnsObj = bioTreatmentColumns;
        break;
      default:
    }
    return columnsObj.map((column) => (
      <TableCell align={column.align} style={{ minWidth: column.minWidth }} key={column.id}>
        <Typography fontSize={'1rem'}>{column.label}</Typography>
      </TableCell>
    ));
  };

  return (
    <Accordion style={{ marginTop: 15, alignItems: 'center' }}>
      <AccordionSummary style={{ fontWeight: 'bold', fontSize: '1.125rem', marginLeft: 10, marginRight: 10 }}>
        <>{type}</>
        {type === 'Mechanical' || type === 'Chemical' ? <>Treatment</> : null}
      </AccordionSummary>
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer>
          <Table size="small" aria-label="treatments table">
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
