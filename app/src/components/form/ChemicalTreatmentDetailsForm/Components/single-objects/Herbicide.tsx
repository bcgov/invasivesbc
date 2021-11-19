import { Typography, Box, Button, TextField } from '@material-ui/core';
import DeleteIcon from '@mui/icons-material/Delete';
import React, { useContext, useEffect, useState } from 'react';
import { IHerbicide } from '../../Models';
import CustomAutoComplete from '../../CustomAutoComplete';
import { ChemicalTreatmentDetailsContext } from '../../ChemicalTreatmentDetailsContext';

export interface IHerbicideComponent {
  herbicide: any;
  key: number;
  index: number;
  classes: any;
  insideTankMix?: boolean;
}

const Herbicide: React.FC<IHerbicideComponent> = ({ herbicide, key, index, classes, insideTankMix }) => {
  const formDataContext = useContext(ChemicalTreatmentDetailsContext);
  const { formDetails, setFormDetails } = formDataContext;

  const businessCodes = formDetails.businessCodes;
  const chemicalApplicationMethod = formDetails.formData.chemical_application_method;
  const tankMixOn = formDetails.formData.tank_mix;

  //get arrays for spray and direct chemical methods
  const chemical_method_direct_code_values = businessCodes['chemical_method_direct'].map((code) => {
    return code.value;
  });
  const chemicalApplicationMethodType = chemical_method_direct_code_values.includes(chemicalApplicationMethod)
    ? 'direct'
    : 'spray';

  const [currentHerbicide, setCurrentHerbicide] = useState<IHerbicide>(formDetails.formData.herbicides[index]);

  const [herbicideTypeChoices, setHerbicideTypeChoices] = useState<any[]>([]);
  const [herbicideChoices, setHerbicideChoices] = useState<any[]>([]);
  const [calculationTypeChoices, setCalculationTypeChoices] = useState<any[]>([]);

  //creating valueLabels to to get the lable for heading
  let optionValueLabels = {};
  const herbicide_type_code =
    herbicide.herbicide_type_code === 'G' ? 'granular_herbicide_code' : 'liquid_herbicide_code';
  Object.values(businessCodes[herbicide_type_code] as any[]).forEach((option) => {
    optionValueLabels[option.value] = option.label || option.title || option.value;
  });

  //update this herbicide inside context
  useEffect(() => {
    if (currentHerbicide !== herbicide) {
      if (insideTankMix) {
        setFormDetails((prevDetails) => {
          const newHerbArr = formDetails.formData.herbicides;
          newHerbArr[index] = { ...currentHerbicide };
          return {
            ...prevDetails,
            formData: {
              ...prevDetails.formData,
              tank_mix_object: { ...prevDetails.formData.tank_mix_object, herbicides: [...newHerbArr] }
            }
          };
        });
      } else {
        setFormDetails((prevDetails) => {
          const newHerbArr = formDetails.formData.herbicides;
          newHerbArr[index] = { ...currentHerbicide };
          return {
            ...prevDetails,
            formData: { ...prevDetails.formData, herbicides: [...newHerbArr] }
          };
        });
      }
    }
  }, [currentHerbicide]);

  //update choices for autocomplete fields
  useEffect(() => {
    switch (herbicide.herbicide_type_code) {
      case 'G': {
        setHerbicideChoices(businessCodes.granular_herbicide_code);
        break;
      }
      case 'L': {
        setHerbicideChoices(businessCodes.liquid_herbicide_code);
        break;
      }
      default:
        setHerbicideChoices([]);
        break;
    }
    switch (chemicalApplicationMethodType) {
      case 'spray':
        setHerbicideTypeChoices(businessCodes['herbicide_type_code']);
        setCalculationTypeChoices(businessCodes['calculation_type_code']);
        break;
      case 'direct':
        setHerbicideTypeChoices(
          businessCodes['herbicide_type_code'].filter((herb) => {
            return herb.value === 'G';
          })
        );
        setCalculationTypeChoices(
          businessCodes['calculation_type_code'].filter((herb) => {
            return herb.value === 'D';
          })
        );
        break;
      default:
        setHerbicideTypeChoices([]);
        setCalculationTypeChoices([]);
        break;
    }
  }, [herbicide, chemicalApplicationMethodType]);

  return (
    <>
      <Box component="span" className={classes.listItemContainer}>
        <Typography className={classes.speciesHeading} variant="h5">
          {optionValueLabels[herbicide.herbicide_code]
            ? optionValueLabels[herbicide.herbicide_code]
            : `Herbicide #${index + 1}`}
        </Typography>

        <CustomAutoComplete
          choices={herbicideTypeChoices}
          className={'inputField'}
          classes={classes}
          id={'herbicide-type'}
          label={'Herbicide Type'}
          parentState={{ herbicide, setCurrentHerbicide }}
          parentName={'herbicide'}
          fieldName={'herbicide_type_code'}
          onChange={(event, value) => {
            if (value === null) {
              return;
            }
            setCurrentHerbicide((prevHerbicide) => {
              return { ...prevHerbicide, herbicide_type_code: (value as any).value };
            });
          }}
        />

        <CustomAutoComplete
          choices={herbicideChoices}
          className={'inputField'}
          classes={classes}
          id={'herbicide-code'}
          label={'Herbicide'}
          parentState={{ herbicide, setCurrentHerbicide }}
          parentName={'herbicide'}
          fieldName={'herbicide_code'}
          onChange={(event, value) => {
            if (value === null) {
              return;
            }
            setCurrentHerbicide((prevHerbicide) => {
              return { ...prevHerbicide, herbicide_code: (value as any).value };
            });
          }}
        />

        {!tankMixOn && (
          <CustomAutoComplete
            choices={calculationTypeChoices}
            className={'inputField'}
            classes={classes}
            id={'calculation_type'}
            label={'Calculation Type'}
            parentState={{ herbicide, setCurrentHerbicide }}
            parentName={'herbicide'}
            fieldName={'calculation_type'}
            onChange={(event, value) => {
              if (value === null) {
                return;
              }
              setCurrentHerbicide((prevHerbicide) => {
                return { ...prevHerbicide, calculation_type: (value as any).value };
              });
            }}
          />
        )}

        {tankMixOn && (
          <TextField
            className={classes.inputField}
            type="number"
            // error={currentHerbicideErrorSchema?.application_rate?.__errors?.length > 0 || false}
            label="Product Application Rate (l/ha)"
            // helperText={currentHerbicideErrorSchema?.application_rate?.__errors[0] || ''}
            value={herbicide.application_rate || ''}
            variant="outlined"
            onChange={(event) => {
              if (event.target.value === null) {
                return;
              }
              setCurrentHerbicide((prevFields) => ({
                ...prevFields,
                application_rate: Number(event.target.value)
              }));
            }}
            defaultValue={undefined}
          />
        )}

        {!tankMixOn && (
          <TextField
            className={classes.inputField}
            type="number"
            label="Amount of Mix Used"
            value={herbicide.amount_of_mix || ''}
            variant="outlined"
            onChange={(event) => {
              if (event.target.value === null) {
                return;
              }
              setCurrentHerbicide((prevFields) => ({
                ...prevFields,
                amount_of_mix: Number(event.target.value)
              }));
            }}
            defaultValue={undefined}
          />
        )}

        {!tankMixOn && currentHerbicide.calculation_type === 'D' ? (
          <>
            <TextField
              className={classes.inputField}
              type="number"
              label="Dilution"
              value={herbicide.dilution || ''}
              variant="outlined"
              onChange={(event) => {
                if (event.target.value === null) {
                  return;
                }
                setCurrentHerbicide((prevFields) => ({
                  ...prevFields,
                  dilution: Number(event.target.value)
                }));
              }}
              defaultValue={undefined}
            />

            <TextField
              className={classes.inputField}
              type="number"
              label="Area Treated (sqm)"
              value={herbicide.area_treated_sqm || ''}
              variant="outlined"
              onChange={(event) => {
                if (event.target.value === null) {
                  return;
                }
                setCurrentHerbicide((prevFields) => ({
                  ...prevFields,
                  area_treated_sqm: Number(event.target.value)
                }));
              }}
              defaultValue={undefined}
            />
          </>
        ) : !tankMixOn && currentHerbicide.calculation_type === 'PAR' ? (
          <>
            <TextField
              className={classes.inputField}
              type="number"
              label="Delivery Rate of Mix"
              value={herbicide.delivery_rate_of_mix || ''}
              variant="outlined"
              onChange={(event) => {
                if (event.target.value === null) {
                  return;
                }
                setCurrentHerbicide((prevFields) => ({
                  ...prevFields,
                  delivery_rate_of_mix: Number(event.target.value)
                }));
              }}
              defaultValue={undefined}
            />

            <TextField
              className={classes.inputField}
              type="number"
              // error={currentHerbicideErrorSchema?.application_rate?.__errors?.length > 0}
              label="Product Application Rate"
              // helperText={currentHerbicideErrorSchema?.application_rate?.__errors[0] || ''}
              value={herbicide.application_rate || ''}
              variant="outlined"
              onChange={(event) => {
                if (event.target.value === null) {
                  return;
                }
                setCurrentHerbicide((prevFields) => ({
                  ...prevFields,
                  application_rate: Number(event.target.value)
                }));
              }}
              defaultValue={undefined}
            />
          </>
        ) : null}

        <Button
          onClick={() => {
            if (insideTankMix) {
              setFormDetails((prevDetails) => {
                const newHerbicidesArr = [...prevDetails.formData.herbicides];
                newHerbicidesArr.splice(index, 1);
                return {
                  ...prevDetails,
                  formData: {
                    ...prevDetails.formData,
                    tank_mix_object: { ...prevDetails.formData.tank_mix_object, herbicides: [...newHerbicidesArr] }
                  }
                };
              });
            } else {
              setFormDetails((prevDetails) => {
                const newHerbicidesArr = [...prevDetails.formData.herbicides];
                newHerbicidesArr.splice(index, 1);
                return {
                  ...prevDetails,
                  formData: { ...prevDetails.formData, herbicides: [...newHerbicidesArr] }
                };
              });
            }
          }}
          variant="contained"
          className={classes.speciesRemoveButton}
          startIcon={<DeleteIcon />}
          color="secondary">
          Remove Herbicide
        </Button>
      </Box>
    </>
  );
};

export default Herbicide;
