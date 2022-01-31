import { Accordion, AccordionDetails, AccordionSummary, Container, Grid, Theme, Typography } from '@mui/material';
import { ExpandMore } from '@mui/icons-material';
import { makeStyles } from '@mui/styles';
import React from 'react';
import {
  IAPPBiologicalDispersalsTable,
  IAPPBiologicalTreatmentsTable,
  IAPPChemicalTreatmentsTable,
  IAPPMechanicalTreatmentsTable,
  IAPPSurveyTable
} from '../../common/RecordTables';

const useStyles = makeStyles((theme: Theme) => ({
  heading: {
    fontSize: theme.typography.pxToRem(18),
    fontWeight: theme.typography.fontWeightRegular,
    align: 'center'
  },
  wideCell: {
    minWidth: 500,
    maxWidth: 500
  },
  missingValue: {
    fontStyle: 'italic',
    color: '#777'
  }
}));

export interface IAPPSitePropType {
  record: any;
}

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

interface MonitoringColumn {
  id: 'monitoring_id' | 'inspection_date' | 'agency' | 'paper_file_id' | 'efficiency_rating';
  label: string;
  minWidth?: number;
  align?: 'right';
  format?: (value: number) => string;
}

const monitoringColumns: readonly MonitoringColumn[] = [
  { id: 'monitoring_id', label: 'Monitoring ID', minWidth: 150 },
  { id: 'inspection_date', label: 'Inspection Date', minWidth: 200 },
  { id: 'agency', label: 'Agency', minWidth: 200 },
  { id: 'paper_file_id', label: 'Paper File ID', minWidth: 200 },
  { id: 'efficiency_rating', label: 'Efficiency Rating', minWidth: 100 }
];

const MonitoringRow = (props) => {
  const { row } = props;
  const [shortComment, setShortComment] = React.useState(true);

  return (
    <React.Fragment>
      <TableRow tabIndex={-1} key={row.monitoring_id}>
        {monitoringColumns.map((column) => {
          const value = row[column.id];
          return (
            <TableCell key={column.id} align={column.align}>
              {value}
            </TableCell>
          );
        })}
      </TableRow>
    </React.Fragment>
  );
};

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

  const expandedIconOutput = () => {
    return open ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />;
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
                    return <MonitoringRow columns={monitoringColumns} row={item} />;
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

const TreatmentsTable = (props) => {
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
        {type} Treatments
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

export const IAPPSite: React.FC<IAPPSitePropType> = (props) => {
  console.log('form data', props);
  const classes = useStyles();
  const form_data = props?.record?.point_of_interest_payload?.form_data;
  const site = {
    ...form_data?.point_of_interest_data,
    ...form_data?.point_of_interest_type_data
  };
  const { surveys, mechanical_treatments, chemical_treatments, biological_treatments, biological_dispersals } =
    form_data;
  const coordinates = props?.record?.point_of_interest_payload?.geometry[0]?.geometry?.coordinates;
  const longitude = parseFloat(coordinates[0]).toFixed(6);
  const latitude = parseFloat(coordinates[1]).toFixed(6);

  const ifApplicable = (value) =>
    value && String(value).trim() ? value : <div className={classes.missingValue}>N/A</div>;

  return (
    <Container>
      <Accordion defaultExpanded={true}>
        <AccordionSummary expandIcon={<ExpandMore />} aria-controls="panel-map-content" id="panel-map-header">
          <Typography className={classes.heading}>Legacy IAPP Site: {site?.site_id}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={1}>
            <Grid item xs={3} sm={2}>
              Created
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.created_date_on_device)}
            </Grid>
            <Grid item xs={3} sm={2}>
              Slope
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.slope_code)}
            </Grid>

            <Grid item xs={3} sm={2}>
              PaperFile
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.project_code[0]?.description)}
            </Grid>
            <Grid item xs={3} sm={2}>
              Aspect
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.aspect_code)}
            </Grid>

            <Grid item xs={3} sm={2}>
              Longitude
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(longitude)}
            </Grid>
            <Grid item xs={3} sm={2}>
              Latitude
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(latitude)}
            </Grid>

            <Grid item xs={3} sm={2}>
              Elevation
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.elevation)}
            </Grid>
            <Grid item xs={3} sm={2}>
              Specific Use
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.specific_use_code)}
            </Grid>

            <Grid item xs={3} sm={2}>
              Mapsheet
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.map_sheet)}
            </Grid>
            <Grid item xs={3} sm={2}>
              Soil Texture
            </Grid>
            <Grid item xs={9} sm={4}>
              {ifApplicable(site?.soil_texture_code)}
            </Grid>

            <Grid item xs={3} sm={2}>
              Jurisdiction
            </Grid>
            <Grid item xs={3}>
              {(surveys?.[0]?.jurisdictions?.length > 0 &&
                ifApplicable(surveys[0]?.jurisdictions[0]?.jurisdiction_code) +
                  ' (' +
                  surveys[0]?.jurisdictions[0]?.percent_covered +
                  '%)') ||
                'Not Provided'}
            </Grid>
            <Grid item xs={3}>
              {surveys?.[0]?.jurisdictions?.length > 1 &&
                ifApplicable(surveys[0]?.jurisdictions[1]?.jurisdiction_code) +
                  ' (' +
                  surveys[0]?.jurisdictions[1]?.percent_covered +
                  '%)'}
            </Grid>
            <Grid item xs={3}>
              {surveys?.[0]?.jurisdictions?.length > 2 &&
                ifApplicable(surveys[0]?.jurisdictions[2].jurisdiction_code) +
                  ' (' +
                  surveys[0]?.jurisdictions[2]?.percent_covered +
                  '%)'}
            </Grid>

            <Grid item xs={3} sm={2}>
              Access Description
            </Grid>
            <Grid item xs={9} sm={10}>
              {ifApplicable(site?.access_description)}
            </Grid>

            <Grid item xs={3} sm={2}>
              Comments
            </Grid>
            <Grid item xs={9} sm={10}>
              {ifApplicable(site?.general_comment)}
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      <IAPPSurveyTable rows={surveys} />

      {/* oldRecords {mechanical_treatments && <IAPPMechanicalTreatmentsTable rows={mechanical_treatments} />} */}
      <TreatmentsTable type={'Mechanical'} treatments={mechanical_treatments} />

      {/* oldRecords {chemical_treatments && <IAPPChemicalTreatmentsTable rows={chemical_treatments} />} */}
      <TreatmentsTable type={'Chemical'} treatments={chemical_treatments} />

      {/* oldRecords {biological_treatments && <IAPPBiologicalTreatmentsTable rows={biological_treatments} />} */}
      <TreatmentsTable type={'Biological Treatment'} treatments={biological_treatments} />

      {/* oldRecords {biological_dispersals && <IAPPBiologicalDispersalsTable rows={biological_dispersals} />} */}
      <TreatmentsTable type={'Biological Dispersal'} treatments={biological_dispersals} />
    </Container>
  );
};
