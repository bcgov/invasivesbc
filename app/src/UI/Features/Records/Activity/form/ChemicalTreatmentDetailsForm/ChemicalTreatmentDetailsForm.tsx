import {
  Box,
  CircularProgress,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  List,
  ListItem,
  Radio,
  RadioGroup,
  Tooltip,
  Typography
} from '@mui/material';
import { ChangeEvent, useEffect, useState } from 'react';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import CustomAutoComplete from 'UI/Features/Records/Activity/form/ChemicalTreatmentDetailsForm/CustomAutoComplete';
import {
  ChemicalTreatmentDetailsContextProvider,
  IChemicalDetailsContextformDetails
} from 'UI/Features/Records/Activity/form/ChemicalTreatmentDetailsForm/ChemicalTreatmentDetailsContext';
import HerbicidesAccordion from 'UI/Features/Records/Activity/form/ChemicalTreatmentDetailsForm/Components/accordions/HerbicidesAccordion';
import TankMixAccordion from 'UI/Features/Records/Activity/form/ChemicalTreatmentDetailsForm/Components/accordions/TankMixAccordion';
import InvasivePlantsAccordion from 'UI/Features/Records/Activity/form/ChemicalTreatmentDetailsForm/Components/accordions/InvasivePlantsAccordion';
import { performCalculation, runValidation, ValidationError } from 'sharedAPI';
import { GeneralDialog, IGeneralDialog } from 'UI/Reusable/GeneralDialog/GeneralDialog';
import CalculationResultsTable from 'UI/Features/Records/Activity/form/ChemicalTreatmentDetailsForm/Components/single-objects/CalculationResultsTable';
import { useSelector } from 'react-redux';

type PropTypes = {
  activitySubType: Record<PropertyKey, unknown>;
  disabled: boolean;
  form_data: Record<PropertyKey, unknown>;
  onChange: (form_data: Record<PropertyKey, unknown>, callback: (() => void) | null) => void;
};

const ChemicalTreatmentDetailsForm = ({ activitySubType, disabled, form_data, onChange }: PropTypes) => {
  const [warningDialog, setWarningDialog] = useState<IGeneralDialog>({
    dialogActions: [],
    dialogOpen: false,
    dialogTitle: '',
    dialogContentText: undefined
  });
  const [calculationResults, setCalculationResults] = useState<Record<PropertyKey, unknown> | null>();
  const [localErrors, setLocalErrors] = useState<ValidationError[]>([]);
  const [reportedArea, setReportedArea] = useState(0);
  const [formDetails, setFormDetails] = useState<IChemicalDetailsContextformDetails>({
    form_data: { ...form_data.activity_subtype_data.chemical_treatment_details }
  });
  const [tankMixOn, setTankMixOn] = useState<boolean>(formDetails.form_data.tank_mix);
  const [chemicalApplicationMethod, setChemicalApplicationMethod] = useState(
    formDetails.form_data.chemical_application_method
  );

  /**
   * @desc Grabs codes from the apiSpec tailored to ChemicalTreatmentDetails sections
   * @returns {Record<PropertyKey, any>[]}
   */
  const createCodes = (): Record<PropertyKey, unknown[]> => {
    const sharedcodes = apiDocsWithViewOptions;
    const newCodes: Record<PropertyKey, unknown> = {};
    for (const key of Object.keys(sharedcodes)) {
      newCodes[key] = sharedcodes[key].options.map(({ value, label }) => ({
        value,
        label
      }));
    }
    return newCodes;
  };

  /**
   * @desc Creates an object containing all codesets used by the component
   * @returns {Record<PropertyKey, any>}
   */
  const createDictionary = (): Record<PropertyKey, unknown> => {
    const herbicideDictionary: Record<PropertyKey, unknown> = {};
    [...codes.liquid_herbicide_code, ...codes.granular_herbicide_code].forEach(
      (item) => (herbicideDictionary[item.value] = item.label)
    );

    const chemicalMethodsDirect = codes.chemical_method_direct;
    const chemicalApplicationMethodChoices: unknown[] = formDetails.form_data.tank_mix
      ? [...codes.chemical_method_spray]
      : [...codes.chemical_method_spray, ...chemicalMethodsDirect];
    const chemical_method_direct_code_values: string[] = chemicalMethodsDirect.map((code) => code.value);

    return {
      herbicideDictionary,
      chemicalApplicationMethodChoices,
      chemical_method_direct_code_values
    };
  };

  const subtypeSchema = 'ChemicalTreatment_Species_Codes';
  const apiDocsWithViewOptions = useSelector(
    (state: Record<PropertyKey, unknown>) =>
      state.UserSettings.apiDocsWithViewOptions.components?.schemas[subtypeSchema].properties
  );
  const codes: Record<PropertyKey, unknown> = createCodes();
  const codeDictionary: Record<PropertyKey, unknown[]> = createDictionary();

  // After initial load, setFormDetails to contain all needed keys
  useEffect(() => {
    setFormDetails({
      form_data: { ...form_data.activity_subtype_data.chemical_treatment_details },
      businessCodes: codes,
      herbicideDictionary: codes?.herbicideDictionary,
      activitySubType: activitySubType,
      disabled: disabled,
      errors: []
    });
  }, [disabled]);

  useEffect(() => {
    setReportedArea(form_data.activity_data.reported_area);
  }, [form_data]);

  useEffect(() => {
    onChange(
      {
        ...form_data,
        activity_subtype_data: {
          ...form_data.activity_subtype_data,
          chemical_treatment_details: { ...formDetails.form_data }
        }
      },
      () => {
        const lerrors = [];
        //run validation
        const newErr = runValidation(
          reportedArea,
          formDetails.form_data,
          lerrors,
          codes,
          codeDictionary?.herbicideDictionary,
          formDetails.form_data.skipAppRateValidation
        );
        setLocalErrors([...newErr]);

        //if no errors, perform calculations
        if (newErr.every((err) => err.severity === 'warning')) {
          const results = performCalculation(reportedArea, formDetails.form_data);
          setCalculationResults(results);
          onChange(
            {
              ...form_data,
              activity_subtype_data: {
                ...form_data.activity_subtype_data,
                chemical_treatment_details: {
                  ...formDetails.form_data,
                  calculation_results: results,
                  errors: Object.keys(results).length === 0
                }
              }
            },
            null
          );
        } else {
          onChange(
            {
              ...form_data,
              activity_subtype_data: {
                ...form_data.activity_subtype_data,
                chemical_treatment_details: {
                  ...formDetails.form_data,
                  errors: true,
                  calculation_results: undefined
                }
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
    localErrors.forEach((err) => {
      if (err?.message?.includes('exceeds maximum applicable rate of')) {
        setWarningDialog({
          dialogOpen: true,
          dialogTitle: 'Warning!',
          dialogContentText: `${err.message}. Do you wish to proceed?`,
          dialogActions: [
            {
              actionName: 'No',
              actionOnClick: () => setWarningDialog({ ...warningDialog, dialogOpen: false })
            },
            {
              actionName: 'Yes',
              actionOnClick: () => {
                setWarningDialog({ ...warningDialog, dialogOpen: false });
                setFormDetails((prev) => ({ ...prev, form_data: { ...prev.form_data, skipAppRateValidation: true } }));
              },
              autoFocus: true
            }
          ]
        });
      }
    });
  }, [localErrors]);

  useEffect(() => {
    if (!codeDictionary) {
      return;
    }
    setFormDetails((prevFormDetails) => ({
      ...prevFormDetails,
      form_data: {
        ...prevFormDetails.form_data,
        tank_mix: tankMixOn,
        chemical_application_method: chemicalApplicationMethod,
        chemical_application_method_type: codeDictionary.chemical_method_direct_code_values.includes(
          chemicalApplicationMethod
        )
          ? 'direct'
          : 'spray'
      }
    }));
  }, [tankMixOn, chemicalApplicationMethod]);

  if (!formDetails.activitySubType || !formDetails?.form_data) {
    return <CircularProgress />;
  }
  return (
    <ChemicalTreatmentDetailsContextProvider value={{ formDetails, setFormDetails }}>
      <Typography variant="h5">Chemical Treatment Details</Typography>
      <Divider />
      <FormControl sx={{ width: '100%' }}>
        <InvasivePlantsAccordion />
        <Box>
          <Box sx={{ width: '100%', maxWidth: '350px' }}>
            <Tooltip
              classes={{ tooltip: 'toolTip' }}
              style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
              placement="left"
              title="Check if there is a mix of herbicides in the tank"
            >
              <HelpOutlineIcon />
            </Tooltip>
            <FormLabel style={{ marginTop: '25px', textAlign: 'left' }} component="legend">
              Tank Mix
            </FormLabel>

            <RadioGroup
              onChange={() => setTankMixOn((prevState) => !prevState)}
              value={tankMixOn}
              aria-label="tank_mix"
              name="tank_mix"
            >
              <FormControlLabel value={true} control={<Radio disabled={disabled} />} label="On" />
              <FormControlLabel value={false} control={<Radio disabled={disabled} />} label="Off" />
            </RadioGroup>
          </Box>
          <Box sx={{ width: '100%', maxWidth: '350px' }}>
            <Tooltip
              classes={{ tooltip: 'toolTip' }}
              style={{ float: 'right', marginBottom: 5, color: 'rgb(170, 170, 170)' }}
              placement="left"
              title="Choose treatment application method"
            >
              <HelpOutlineIcon />
            </Tooltip>

            <CustomAutoComplete
              choices={codeDictionary.chemicalApplicationMethodChoices}
              className={null}
              disabled={disabled}
              actualValue={chemicalApplicationMethod}
              key={'chemical-application-method'}
              id={'chemical-application-method'}
              label={'Chemical Application Method'}
              parentState={{ chemicalApplicationMethod, setChemicalApplicationMethod }}
              onChange={(_: ChangeEvent, value) => {
                if (value === null) {
                  return;
                }
                setChemicalApplicationMethod(value.value);
              }}
            />
          </Box>
        </Box>
        {!tankMixOn && <HerbicidesAccordion insideTankMix={false} />}
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
          <Typography style={{ marginTop: '1rem' }} variant="h5">
            There are errors in this sub-form:
          </Typography>
          <List dense={true} sx={{ marginBottom: '2rem' }}>
            {localErrors.map((err, index) => (
              <ListItem key={err.message}>
                <Typography color={err.severity} variant="body1">
                  {`${index + 1}. ${err.message}`}
                </Typography>
              </ListItem>
            ))}
          </List>
        </>
      )}
    </ChemicalTreatmentDetailsContextProvider>
  );
};

export default ChemicalTreatmentDetailsForm;
