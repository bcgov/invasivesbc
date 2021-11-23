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
  Tooltip,
  Typography
} from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
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
import { IWarningDialog, WarningDialog } from 'components/dialog/WarningDialog';

const ChemicalTreatmentDetailsForm = (props) => {
  const classes = useFormStyles();

  const [warningDialog, setWarningDialog] = useState<IWarningDialog>({
    dialogActions: [],
    dialogOpen: false,
    dialogTitle: '',
    dialogContentText: null
  });

  const [calculationResults, setCalculationResults] = useState(null);

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
        const newErr = runValidation(
          props.formData.activity_data.reported_area,
          formDetails.formData,
          lerrors,
          businessCodes,
          herbicideDictionary
        );
        setLocalErrors([...newErr]);

        if (newErr.length < 1) {
          const results = performCalculation(
            props.formData.activity_data.reported_area,
            formDetails.formData,
            businessCodes
          );
          console.log(results);
          setCalculationResults(results as any);
        } else {
          setCalculationResults(null);
        }
      }
    );
    // const newErr = runValidation(formData, formDetails.errors, businessCodes);
  }, [formDetails]);

  useEffect(() => {
    localErrors.forEach((err, index) => {
      if (err.includes('exceeds maximum applicable rate of')) {
        setWarningDialog({
          dialogOpen: true,
          dialogTitle: 'Warning!',
          dialogContentText: `${err}. Do you wish to proceed?`,
          dialogActions: [
            {
              actionName: 'No',
              actionOnClick: async () => {
                setWarningDialog({ ...warningDialog, dialogOpen: false });
              }
            },
            {
              actionName: 'Yes',
              actionOnClick: async () => {
                setWarningDialog({ ...warningDialog, dialogOpen: false });

                localErrors.splice(index, 1);
              },
              autoFocus: true
            }
          ]
        });
      }
    });
  }, [localErrors]);

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
        <Typography variant="h5">Chemical Treatment Details</Typography>
        <Divider />

        {localErrors.length > 0 && (
          <>
            <Typography style={{ marginTop: '1rem' }} color={'error'} variant="h5">
              There are errors in this sub-form:
            </Typography>
            <List dense={true}>
              {localErrors.map((err, index) => (
                <ListItem key={index}>
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
              <Tooltip
                style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
                placement="left"
                title="Check if there is a mix of herbicides in the tank">
                <HelpOutlineIcon />
              </Tooltip>
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
              <Tooltip
                style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
                placement="left"
                title="Choose treatment application method">
                <HelpOutlineIcon />
              </Tooltip>
              <CustomAutoComplete
                choices={chemicalApplicationMethodChoices}
                className={null}
                actualValue={chemicalApplicationMethod}
                classes={classes}
                key={'chemical-application-method'}
                id={'chemical-application-method'}
                label={'Chemical Application Method'}
                onChange={(event, value) => {
                  if (value === null) {
                    return;
                  }
                  setChemicalApplicationMethod(value.value);
                }}
                parentState={{ chemicalApplicationMethod, setChemicalApplicationMethod }}
              />
            </Box>
          </Box>

          <HerbicidesAccordion insideTankMix={false} />

          <TankMixAccordion />

          {calculationResults && (
            <>
              <Typography style={{ marginTop: '1rem' }} variant="h4">
                Calculation Results
              </Typography>
              <Divider />
              {Object.keys(calculationResults).map((key) => {
                return (
                  <Typography key={key} style={{ lineHeight: '1.5rem' }} variant={'body1'}>{`${key}: ${
                    typeof calculationResults[key] === 'object'
                      ? JSON.stringify(calculationResults[key])
                      : calculationResults[key]
                  }`}</Typography>
                );
              })}
              {Object.keys(calculationResults).length < 1 && (
                <Typography style={{ marginTop: '10px' }} variant={'body1'} color={'error'}>
                  Couldn't perform calculation because of the invalid scenario.
                </Typography>
              )}
            </>
          )}
        </FormControl>
        <WarningDialog
          dialogOpen={warningDialog.dialogOpen}
          dialogTitle={warningDialog.dialogTitle}
          dialogActions={warningDialog.dialogActions}
          dialogContentText={warningDialog.dialogContentText}
        />
      </ChemicalTreatmentDetailsContextProvider>
    )
  );
};

export default ChemicalTreatmentDetailsForm;
