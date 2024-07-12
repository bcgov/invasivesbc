import {
  Box,
  CircularProgress,
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
import RootUISchemas from 'rjsf/uiSchema/RootUISchemas';
import { useSelector } from 'react-redux';

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
  const [localErrors, setLocalErrors] = useState([]);
  const [reportedArea, setReportedArea] = useState(0);

  /******************************************************************************
   * MY SPOT
   *******************************************************************************/


  const apiDocsWithViewOptions = useSelector((state) => state.UserSettings.apiDocsWithViewOptions);
  const [codes, setCodes] = useState<Record<string, any>>();
  const [codeDictionary, setCodeDictionary] = useState<Record<string, any>>();
  const [formDetails, setFormDetails] = React.useState<IChemicalDetailsContextformDetails>({
    form_data: { ...props.form_data.activity_subtype_data.chemical_treatment_details },
  });
  const [tankMixOn, setTankMixOn] = useState(formDetails.form_data.tank_mix);
  const [chemicalApplicationMethod, setChemicalApplicationMethod] = useState(
    formDetails.form_data.chemical_application_method
  );
  const getCodesFromAPISpec = () => {
    const subtypeSchema = 'ChemicalTreatment_Species_Codes';
    const codes = (apiDocsWithViewOptions as any).components?.schemas[subtypeSchema].properties;
    const newBusinessCodes = {};
    for (let key of Object.keys(codes)) {
      newBusinessCodes[key] = codes[key].options
        .map(({ value, label }) => ({
          value,
          label
        }))
    }
    setCodes({ ...newBusinessCodes });
  };

  const createDictionary = () => {
    const herbicideDictionary: Record<string, any> = {};
    [
      ...codes!.liquid_herbicide_code,
      ...codes!.granular_herbicide_code
    ].forEach((item) => herbicideDictionary[item.value] = item.label)

    const chemicalMethodsDirect = codes!.chemical_method_direct
    const chemicalApplicationMethodChoices: any[] = formDetails.form_data.tank_mix
      ? [...codes!.chemical_method_spray]
      : [...codes!.chemical_method_spray, ...chemicalMethodsDirect]

    const chemical_method_direct_code_values: string[] = chemicalMethodsDirect.map(code => code.value)

    setCodeDictionary({
      herbicideDictionary,
      chemicalApplicationMethodChoices,
      chemical_method_direct_code_values,
    })
  }

  useEffect(() => {
    getCodesFromAPISpec()
    createDictionary();
    setFormDetails({
      form_data: { ...props.form_data.activity_subtype_data.chemical_treatment_details },
      businessCodes: codes,
      herbicideDictionary: codes?.herbicideDictionary,
      activitySubType: props.activitySubType,
      disabled: props.disabled,
      errors: []
    })
  }, []);

  /******************************************************************************
   * END OF MY SPOT
   *******************************************************************************/



  useEffect(() => {
    setReportedArea(props.form_data.activity_data.reported_area);
  }, [props.form_data]);


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
          codes,
          codeDictionary!?.herbicideDictionary,
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



  useEffect(() => {
    if (!codeDictionary) { return; }
    setFormDetails((prevFormDetails) => ({
      ...prevFormDetails,
      form_data: {
        ...prevFormDetails.form_data,
        tank_mix: tankMixOn,
        chemical_application_method: chemicalApplicationMethod,
        chemical_application_method_type: codeDictionary.chemical_method_direct_code_values.includes(chemicalApplicationMethod)
          ? 'direct'
          : 'spray'
      }
    }));
    console.log("Who shot first")
  }, [tankMixOn, chemicalApplicationMethod]);

  if (!codeDictionary || !formDetails) { return <CircularProgress /> }
  return (
    <ChemicalTreatmentDetailsContextProvider value={{ formDetails, setFormDetails }}>
      <Typography variant="h5">Chemical Treatment Details</Typography>
      <Divider />
      <FormControl>
        <InvasivePlantsAccordion />
        <Box>
          <Box>
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
              name="tank_mix">
              <FormControlLabel value={true} control={<Radio disabled={props.disabled} />} label="On" />
              <FormControlLabel value={false} control={<Radio disabled={props.disabled} />} label="Off" />
            </RadioGroup>
          </Box>
          <Box>
            <Tooltip
              classes={{ tooltip: 'toolTip' }}
              style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
              placement="left"
              title="Choose treatment application method">
              <HelpOutlineIcon />
            </Tooltip>

            <CustomAutoComplete
              choices={codeDictionary.chemicalApplicationMethodChoices}
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

        {/* {!tankMixOn && <HerbicidesAccordion insideTankMix={false} />} */}

        {/* {formDetails && <TankMixAccordion />} */}

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
