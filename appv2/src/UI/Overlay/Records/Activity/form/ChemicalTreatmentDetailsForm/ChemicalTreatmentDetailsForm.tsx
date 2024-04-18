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
} from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CustomAutoComplete from './CustomAutoComplete';
import {
  ChemicalTreatmentDetailsContextProvider,
  IChemicalDetailsContextformDetails
} from './ChemicalTreatmentDetailsContext';
import HerbicidesAccordion from './Components/accordions/HerbicidesAccordion';
import TankMixAccordion from './Components/accordions/TankMixAccordion';
import InvasivePlantsAccordion from './Components/accordions/InvasivePlantsAccordion';
//import { useFormStyles } from './formStyles';
import { runValidation } from 'sharedAPI';
import { performCalculation } from 'sharedAPI';
import { GeneralDialog, IGeneralDialog } from 'UI/Overlay/GeneralDialog';
import CalculationResultsTable from './Components/single-objects/CalculationResultsTable';
import { RENDER_DEBUG } from 'UI/App';

const ChemicalTreatmentDetailsForm = (props) => {
  //const classes = useFormStyles();
  const ref = useRef(0);
  ref.current += 1;
  if (RENDER_DEBUG) console.log('%cChemTreatmentDetailsForm:' + ref.current.toString(), 'color: yellow');

  const [warningDialog, setWarningDialog] = useState<IGeneralDialog>({
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
      if (props.schema.components.schemas.ChemicalTreatment_Species_Codes.properties[key].anyOf) {
        newBusinessCodes[key] = props.schema.components.schemas.ChemicalTreatment_Species_Codes.properties[
          key
        ].anyOf.map((code) => {
          return {
            value: code.enum[0],
            label: code.title
          };
        });
      } else {
        newBusinessCodes[key] = props.schema.components.schemas.ChemicalTreatment_Species_Codes.properties[
          key
        ].options.map((code) => {
          return {
            value: code.value,
            label: code.label
          };
        });
      }
    }
    return newBusinessCodes;
  };

  const businessCodes = getBusinessCodes();

  //constructing herbicide dictionary to get the correct labels for herbicides when displaying errors
  let herbicideDictionary = {};
  let allHerbCodes = [
    ...(businessCodes as any).liquid_herbicide_code,
    ...(businessCodes as any).granular_herbicide_code
  ];
  allHerbCodes.forEach((row) => {
    herbicideDictionary[row.value] = row.label;
  });

  //main usestate that holds all form data
  const [formDetails, setFormDetails] = React.useState<IChemicalDetailsContextformDetails>({
    form_data: { ...props.form_data.activity_subtype_data.chemical_treatment_details },
    businessCodes: businessCodes,
    herbicideDictionary: herbicideDictionary,
    activitySubType: props.activitySubType,
    disabled: props.disabled,
    //    classes: classes,
    errors: []
  });
  //used to render the list of errors
  const [localErrors, setLocalErrors] = useState([]);
  const [reportedArea, setReportedArea] = useState(0);

  useEffect(() => {
    setReportedArea(props.form_data.activity_data.reported_area);
  }, [props.form_data]);

  //when formDetails change, run validation and if it passes, perform calculations
  useEffect(() => {
    props.onChange(
      {
        ...props.form_data,
        activity_subtype_data: {
          ...props.form_data.activity_subtype_data,
          chemical_treatment_details: { ...formDetails.form_data }
        }
      },
      () => {
        let lerrors = [];
        //run validation
        const newErr = runValidation(
          reportedArea,
          formDetails.form_data,
          lerrors,
          businessCodes,
          herbicideDictionary,
          formDetails.form_data.skipAppRateValidation
        );
        setLocalErrors([...newErr]);

        //if no errors, perform calculations
        if (newErr.length < 1) {
          const results = performCalculation(reportedArea, formDetails.form_data, businessCodes);
          setCalculationResults(results as any);
          props.onChange(
            {
              ...props.form_data,
              activity_subtype_data: {
                ...props.form_data.activity_subtype_data,
                chemical_treatment_details: { ...formDetails.form_data, calculation_results: results, errors: false }
              }
            },
            null
          );
        } else {
          props.onChange(
            {
              ...props.form_data,
              activity_subtype_data: {
                ...props.form_data.activity_subtype_data,
                chemical_treatment_details: { ...formDetails.form_data, errors: true, calculation_results: undefined }
              }
            },
            null
          );
          setCalculationResults(null);
        }
      }
    );
  }, [formDetails, reportedArea]);

  //when we get application rate error, display warning dialog and if user presses yes, delete this error
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

                setFormDetails((prev) => {
                  return { ...prev, form_data: { ...prev.form_data, skipAppRateValidation: true } };
                });
              },
              autoFocus: true
            }
          ]
        });
      }
    });
  }, [localErrors]);

  //use state hooks for general fields outside any objects
  const [tankMixOn, setTankMixOn] = useState(formDetails.form_data.tank_mix);
  const [chemicalApplicationMethod, setChemicalApplicationMethod] = useState(
    formDetails.form_data.chemical_application_method
  );

  //set chemical application method choices based on the value of tank mix
  const chemicalApplicationMethodChoices = formDetails.form_data.tank_mix
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
      form_data: {
        ...prevFormDetails.form_data,
        tank_mix: tankMixOn,
        chemical_application_method: chemicalApplicationMethod,
        chemical_application_method_type: chemical_method_direct_code_values.includes(chemicalApplicationMethod)
          ? 'direct'
          : 'spray'
      }
    }));
  }, [tankMixOn, chemicalApplicationMethod]);

  return (
    <ChemicalTreatmentDetailsContextProvider value={{ formDetails, setFormDetails }}>
      <Typography variant="h5">Chemical Treatment Details</Typography>
      <Divider />
      <FormControl
      // className={classes.formControl}
      >
        <InvasivePlantsAccordion />

        <Box
        //className={classes.generalFieldsContainer}
        >
          <Box
          //className={classes.generalFieldColumn}
          >
            <Tooltip
              classes={{ tooltip: 'toolTip' }}
              style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
              placement="left"
              title="Check if there is a mix of herbicides in the tank">
              <HelpOutlineIcon />
            </Tooltip>
            <FormLabel
              //className={classes.formLabel}
              style={{ marginTop: '25px' }}
              component="legend">
              Tank Mix
            </FormLabel>

            <RadioGroup
              onChange={() => {
                setTankMixOn((prevState) => !prevState);
              }}
              value={tankMixOn}
              aria-label="tank_mix"
              //className={classes.tankMixRadioGroup}
              name="tank_mix">
              <FormControlLabel value={true} control={<Radio disabled={props.disabled} />} label="On" />
              <FormControlLabel value={false} control={<Radio disabled={props.disabled} />} label="Off" />
            </RadioGroup>
          </Box>
          <Box
          //className={classes.generalFieldColumn}
          >
            <Tooltip
              classes={{ tooltip: 'toolTip' }}
              style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
              placement="left"
              title="Choose treatment application method">
              <HelpOutlineIcon />
            </Tooltip>
            <CustomAutoComplete
              choices={chemicalApplicationMethodChoices}
              className={null}
              disabled={props.disabled}
              actualValue={chemicalApplicationMethod}
              //  classes={classes}
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

        { !tankMixOn? <HerbicidesAccordion insideTankMix={false} /> : <></>}

        <TankMixAccordion />

        {calculationResults && (
          <>
            <Typography style={{ marginTop: '1rem' }} variant="h4">
              Calculation Results
            </Typography>
            <Divider style={{ marginBottom: '1rem' }} />
            <CalculationResultsTable data={calculationResults} />
            {Object.keys(calculationResults).length < 1 && (
              <Typography style={{ marginTop: '10px' }} variant={'body1'} color={'error'}>
                Couldn't perform calculation because of the invalid scenario.
              </Typography>
            )}
          </>
        )}
      </FormControl>
      <GeneralDialog
        dialogOpen={warningDialog.dialogOpen}
        dialogTitle={warningDialog.dialogTitle}
        dialogActions={warningDialog.dialogActions}
        dialogContentText={warningDialog.dialogContentText}
      />
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
    </ChemicalTreatmentDetailsContextProvider>
  );
};

export default ChemicalTreatmentDetailsForm;
