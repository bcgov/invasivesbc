import {
  Box,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  List,
  ListItem,
  ListItemText,
  Radio,
  RadioGroup,
  Typography
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import CustomAutoComplete from './CustomAutoComplete';
import {
  ChemicalTreatmentDetailsContextProvider,
  IChemicalDetailsContextformDetails
} from './ChemicalTreatmentDetailsContext';
import HerbicidesAccordion from './Components/accordions/HerbicidesAccordion';
import TankMixAccordion from './Components/accordions/TankMixAccordion';
import InvasivePlantsAccordion from './Components/accordions/InvasivePlantsAccordion';
import { useFormStyles } from './formStyles';
import { runValidation } from './Validation';
import { performCalculation } from 'utils/herbicideCalculator';

const ChemicalTreatmentDetailsForm = (props) => {
  const classes = useFormStyles();

  const [calculationResults, setCalculationResults] = useState();

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

  let herbicideDictionary = {};

  let allHerbCodes = [
    ...(businessCodes as any).liquid_herbicide_code,
    ...(businessCodes as any).granular_herbicide_code
  ];

  allHerbCodes.map((row) => {
    herbicideDictionary[row.value] = row.label;
  });

  const [formDetails, setFormDetails] = React.useState<IChemicalDetailsContextformDetails>({
    formData: !props.formData.activity_subtype_data.chemical_treatment_details
      ? {
          invasive_plants: [],
          herbicides: [],
          tank_mix: null,
          chemical_application_method: null,
          tank_mix_object: {
            herbicides: [],
            calculation_type: null
          }
        }
      : { ...props.formData.activity_subtype_data.chemical_treatment_details },
    businessCodes: businessCodes,
    herbicideDictionary: herbicideDictionary,
    classes: classes,
    errors: []
  });

  const [localErrors, setLocalErrors] = useState([]);

  useEffect(() => {
    props.onChange(
      {
        formData: {
          ...props.formData,
          activity_subtype_data: {
            ...props.formData.activity_subtype_data,
            chemical_treatment_details: { ...formDetails.formData }
          }
        }
      },
      null,
      null,
      () => {
        let lerrors = [];
        const newErr = runValidation(formDetails.formData, lerrors, businessCodes, herbicideDictionary);
        setLocalErrors([...newErr]);

        if (newErr.length < 1) {
          setCalculationResults(performCalculation(formDetails.formData, businessCodes) as any);
        } else {
          setCalculationResults(null);
        }
      }
    );
    // const newErr = runValidation(formData, formDetails.errors, businessCodes);
  }, [formDetails]);

  //fields
  const [tankMixOn, setTankMixOn] = useState(formDetails.formData.tank_mix);
  const [chemicalApplicationMethod, setChemicalApplicationMethod] = useState(
    formDetails.formData.chemical_application_method
  );

  //choices
  const chemicalApplicationMethodChoices = formDetails.formData.tank_mix
    ? [...businessCodes['chemical_method_spray']]
    : [...businessCodes['chemical_method_spray'], ...businessCodes['chemical_method_direct']];

  //get arrays for spray and direct chemical methods
  const chemical_method_direct_code_values = businessCodes['chemical_method_direct'].map((code) => {
    return code.value;
  });

  //update context form data when any fields change
  useEffect(() => {
    setFormDetails((prevFormDetails) => ({
      ...prevFormDetails,
      formData: {
        ...prevFormDetails.formData,
        tank_mix: tankMixOn,
        chemical_application_method: chemicalApplicationMethod,
        chemical_application_method_type: chemical_method_direct_code_values.includes(chemicalApplicationMethod)
          ? 'direct'
          : 'spray'
      }
    }));
  }, [tankMixOn, chemicalApplicationMethod]);

  return (
    classes && (
      <ChemicalTreatmentDetailsContextProvider value={{ formDetails, setFormDetails }}>
        <Typography variant="h4">Treatment Details</Typography>
        <Divider />

        {localErrors.length > 0 && (
          <>
            <Typography style={{ marginTop: '1rem' }} color={'error'} variant="h5">
              There are errors in this sub-form:
            </Typography>
            <List dense={true}>
              {localErrors.map((err, index) => (
                <ListItem>
                  <ListItemText
                    style={{ color: '#ff000' }}
                    primary={
                      <Typography color={'error'} variant="body1">
                        {`${index + 1}. ${err}`}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </>
        )}

        <FormControl className={classes.formControl}>
          <InvasivePlantsAccordion />

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
                name="tank_mix">
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
                }}
                parentState={{ chemicalApplicationMethod, setChemicalApplicationMethod }}
                parentName={undefined}
              />
            </Box>
          </Box>

          <HerbicidesAccordion insideTankMix={false} />

          <TankMixAccordion />

          {calculationResults && (
            <>
              <Typography style={{ marginTop: '1rem' }} variant="h5">
                Calculation Results
              </Typography>
              <Divider />
              {Object.keys(calculationResults).map((key) => {
                return (
                  <Typography style={{ lineHeight: '1.5rem' }} variant={'body1'}>{`${key}: ${
                    typeof calculationResults[key] === 'object'
                      ? JSON.stringify(calculationResults[key])
                      : calculationResults[key]
                  }`}</Typography>
                );
              })}
            </>
          )}
        </FormControl>
      </ChemicalTreatmentDetailsContextProvider>
    )
  );
};

export default ChemicalTreatmentDetailsForm;
