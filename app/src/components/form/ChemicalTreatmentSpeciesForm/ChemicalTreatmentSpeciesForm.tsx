import {
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  makeStyles,
  Radio,
  Accordion,
  RadioGroup,
  Theme,
  Typography,
  AccordionSummary,
  AccordionDetails
} from '@material-ui/core';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import AddIcon from '@mui/icons-material/Add';
import React, { useEffect, useState } from 'react';
import InvasiveSpecie from './InvasiveSpecie';
import { IGeneralFields, IHerbicide, ISpecies } from './Models';
import Herbicide from './Herbicide';
import CustomAutoComplete from './CustomAutoComplete';

const useStyles = makeStyles((theme: Theme) => ({
  formContainer: { width: '100%', paddingTop: '2rem', paddingBottom: '2rem' },
  formControl: { width: '100%' },
  generalFieldsContainer: {
    width: '100%',
    paddingTop: '2rem',
    paddingBottom: '2rem',
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      display: 'block'
    },
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around'
  },
  generalFieldColumn: {
    width: '40%',
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    }
  },
  formLabel: { textAlign: 'center' },
  centerBox: { display: 'flex', justifyContent: 'center' },

  inputField: { width: '100%', marginTop: '3rem', marginBottom: '0.5rem' },
  accordionBody: { display: 'block', width: '100%' },
  listContainer: { display: 'flex', flexWrap: 'wrap', width: '100%', justifyContent: 'space-between' },
  listItemContainer: {
    [theme.breakpoints.down('sm')]: {
      width: '100%'
    },
    width: '45%',
    border: '1px solid grey',
    borderRadius: '7px',
    padding: '1rem',
    margin: '1rem'
  },
  speciesHeading: { textAlign: 'center', marginBottom: '1rem' },
  speciesRemoveButton: { float: 'right', marginTop: '0.5rem' },
  tankMixRadioGroup: { flexDirection: 'row', justifyContent: 'center' }
}));

const ChemicalTreatmentSpeciesForm = (props) => {
  const classes = useStyles();

  //get business codes from schema
  const getBusinessCodes = () => {
    const newBusinessCodes = {};
    for (let key of Object.keys(props.schema.components.schemas.ChemicalTreatment_Species_Codes.properties)) {
      newBusinessCodes[key] = props.schema.components.schemas.ChemicalTreatment_Species_Codes.properties[key].anyOf.map(
        (code) => {
          return {
            value: code.enum[0],
            label: code.title
          };
        }
      );
    }
    return newBusinessCodes;
  };
  const businessCodes = getBusinessCodes();

  const [chemicalTreatmentDetails, setChemicalTreatmentDetails] = useState<IGeneralFields>(
    props.formData.activity_subtype_data.chemical_treatment_details
  );

  //fields
  const [tankMixOn, setTankMixOn] = useState(chemicalTreatmentDetails?.tank_mix || false);
  const [chemicalApplicationMethod, setChemicalApplicationMethod] = useState(
    chemicalTreatmentDetails?.chemical_application_method
  );
  const [speciesArr, setSpeciesArr] = useState<ISpecies[]>(chemicalTreatmentDetails?.species_list || []);
  const [herbicidesArr, setHerbicidesArr] = useState<IHerbicide[]>(chemicalTreatmentDetails?.herbicides_list || []);

  //get arrays for spray and direct chemical methods
  const chemical_method_spray_code_values = businessCodes['chemical_method_spray'].map((code) => {
    return code.value;
  });
  const chemical_method_direct_code_values = businessCodes['chemical_method_direct'].map((code) => {
    return code.value;
  });
  //helpers
  const [chemicalApplicationMethodType, setChemicalApplicationMethodType] = useState(
    chemical_method_spray_code_values.includes(chemicalApplicationMethod) ? 'spray' : 'direct'
  );
  const [chemicalApplicationMethodChoices, setChemicalApplicationMethodChoices] = useState([]);

  //update RJSF form data when chem treatment details change
  useEffect(() => {
    props.onChange({
      formData: {
        ...props.formData,
        activity_subtype_data: {
          ...props.formData.activity_subtype_data,
          chemical_treatment_details: chemicalTreatmentDetails
        }
      }
    });
  }, [chemicalTreatmentDetails]);

  //fill chemical_method field with values based on tank_mix value
  useEffect(() => {
    if (!businessCodes) {
      return;
    }
    switch (tankMixOn) {
      case true:
        setChemicalApplicationMethodChoices([...businessCodes['chemical_method_spray']]);
        break;
      case false:
        setChemicalApplicationMethodChoices([
          ...businessCodes['chemical_method_spray'],
          ...businessCodes['chemical_method_direct']
        ]);
        break;
      default:
        setChemicalApplicationMethodChoices([]);
        break;
    }
  }, [tankMixOn, chemicalApplicationMethod, chemicalTreatmentDetails]);

  //update chemical treatment details useState when any fields change
  useEffect(() => {
    setChemicalTreatmentDetails({
      tank_mix: tankMixOn,
      chemical_application_method: chemicalApplicationMethod,
      species_list: speciesArr,
      herbicides_list: herbicidesArr
    });
  }, [tankMixOn, chemicalApplicationMethod, speciesArr, herbicidesArr]);

  return (
    <>
      <Typography variant="h4">Treatment Details</Typography>
      <Divider />

      <FormControl className={classes.formControl}>
        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="species-content" id="species-header">
            <Typography variant="h5">Species</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box className={classes.accordionBody}>
              <Box component="div" className={classes.centerBox}>
                <Button
                  onClick={() => {
                    setSpeciesArr((prevArr) => {
                      const newSpeciesArr = [...prevArr];
                      newSpeciesArr.push({ invasive_plant_code: null });
                      return newSpeciesArr;
                    });
                  }}
                  variant="contained"
                  startIcon={<AddIcon />}
                  color="primary">
                  Add Specie
                </Button>
              </Box>

              <Box component="div" className={classes.listContainer}>
                {speciesArr.map((species, index) => (
                  <InvasiveSpecie
                    key={index}
                    species={species}
                    classes={classes}
                    index={index}
                    businessCodes={businessCodes}
                    speciesArrState={{ speciesArr, setSpeciesArr }}
                  />
                ))}
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Box className={classes.generalFieldsContainer}>
          <Box className={classes.generalFieldColumn}>
            <FormLabel className={classes.formLabel} component="legend">
              Tank Mix
            </FormLabel>
            <RadioGroup
              onChange={() => {
                setTankMixOn((prevState) => !prevState);
              }}
              value={tankMixOn}
              aria-label="tank_mix"
              className={classes.tankMixRadioGroup}
              name="radio-buttons-group">
              <FormControlLabel value={true} control={<Radio />} label="On" />
              <FormControlLabel value={false} control={<Radio />} label="Off" />
            </RadioGroup>
          </Box>
          <Box className={classes.generalFieldColumn}>
            <CustomAutoComplete
              choices={chemicalApplicationMethodChoices}
              className={null}
              classes={classes}
              fieldName={'chemicalApplicationMethod'}
              id={'chemical-application-method'}
              label={'Chemical Application Method'}
              onChange={(event, value) => {
                if (value === null) {
                  return;
                }
                setChemicalApplicationMethod(value.value);
                if (chemical_method_spray_code_values.includes(value.value)) {
                  setChemicalApplicationMethodType('spray');
                } else if (chemical_method_direct_code_values.includes(value.value)) {
                  setChemicalApplicationMethodType('direct');
                }
              }}
              parentState={{ chemicalApplicationMethod, setChemicalApplicationMethod }}
              parentName={undefined}
            />
          </Box>
        </Box>

        <Accordion expanded={!tankMixOn} disabled={tankMixOn}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="herbicides-content" id="herbicides-header">
            <Typography variant="h5">Herbicides</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box className={classes.accordionBody}>
              <Box component="div" className={classes.centerBox}>
                <Button
                  onClick={() => {
                    setHerbicidesArr((prevArr) => {
                      const newHerbicidesArr = [...prevArr];
                      newHerbicidesArr.push({});
                      return newHerbicidesArr;
                    });
                  }}
                  variant="contained"
                  startIcon={<AddIcon />}
                  color="primary">
                  Add Herbicide
                </Button>
              </Box>

              <Box component="div" className={classes.listContainer}>
                {herbicidesArr.map((herbicide, index) => (
                  <Herbicide
                    key={index}
                    herbicide={herbicide}
                    tankMixOn={tankMixOn}
                    chemicalApplicationMethodType={chemicalApplicationMethodType}
                    classes={classes}
                    index={index}
                    businessCodes={businessCodes}
                    herbicidesArrState={{ herbicidesArr, setHerbicidesArr }}
                  />
                ))}
              </Box>
            </Box>
          </AccordionDetails>
        </Accordion>

        <Accordion expanded={tankMixOn} disabled={!tankMixOn}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />} aria-controls="tank-mix-content" id="tank-mix-header">
            <Typography variant="h5">Tank Mix</Typography>
          </AccordionSummary>
          <AccordionDetails>
            <Box className={classes.accordionBody}></Box>
          </AccordionDetails>
        </Accordion>
      </FormControl>
    </>
  );
};

export default ChemicalTreatmentSpeciesForm;
