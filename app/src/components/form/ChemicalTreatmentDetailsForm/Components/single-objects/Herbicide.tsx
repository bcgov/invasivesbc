import { Typography, Box, Button, TextField } from '@material-ui/core';
import DeleteIcon from '@mui/icons-material/Delete';
import React, { useContext, useEffect, useState } from 'react';
import { IHerbicide } from '../../Models';
import CustomAutoComplete from '../../CustomAutoComplete';
import { ChemicalTreatmentDetailsContext } from '../../ChemicalTreatmentDetailsContext';

export interface IHerbicideComponent {
  herbicide: any;
  key: number;
}

const Herbicide: React.FC<IHerbicideComponent> = ({ herbicide, key }) => {
  const formDataContext = useContext(ChemicalTreatmentDetailsContext);
  const { formDetails, setFormDetails } = formDataContext;

  const classes = formDetails.classes;
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

  const [herbicidesArr, setHerbicidesArr] = useState<IHerbicide[]>(formDetails.formData.herbicides);
  const [currentHerbicide, setCurrentHerbicide] = useState<IHerbicide>(formDetails.formData.herbicides[key]);

  const [herbicideTypeChoices, setHerbicideTypeChoices] = useState<any[]>([]);
  const [herbicideChoices, setHerbicideChoices] = useState<any[]>([]);
  const [calculationTypeChoices, setCalculationTypeChoices] = useState<any[]>([]);

  const [calculationFields, setCalculationFields] = useState(currentHerbicide?.calculation_fields || {});

  //creating valueLabels to to get the lable for heading
  let optionValueLabels = {};
  const herbicide_type_code =
    herbicide.herbicide_type_code === 'G' ? 'granular_herbicide_code' : 'liquid_herbicide_code';
  Object.values(businessCodes[herbicide_type_code] as any[]).forEach((option) => {
    optionValueLabels[option.value] = option.label || option.title || option.value;
  });

  //update this herbicide inside herbicides arr
  useEffect(() => {
    if (currentHerbicide !== herbicidesArr[key]) {
      setHerbicidesArr((prevArr) => {
        const newArr = [...prevArr];
        newArr[key] = currentHerbicide;
        return [...newArr];
      });
    }
  }, [currentHerbicide]);

  //update the herbicides array inside context when it changes
  useEffect(() => {
    if (herbicidesArr !== formDetails.formData.herbicides) {
      setFormDetails((prevDetails) => ({
        ...prevDetails,
        formData: { ...prevDetails.formData, herbicidesArr: [...herbicidesArr] }
      }));
    }
  }, [herbicidesArr]);

  //update calculation fields in current herbicide when they change
  useEffect(() => {
    setCurrentHerbicide((prevHerb) => {
      return { ...prevHerb, ...calculationFields };
    });
  }, [calculationFields]);

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
            : `Herbicide #${key + 1}`}
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
            value={calculationFields.application_rate || ''}
            variant="outlined"
            onChange={(event) => {
              if (event.target.value === null) {
                return;
              }
              setCalculationFields((prevFields) => ({
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
            value={calculationFields.amount_of_mix || ''}
            variant="outlined"
            onChange={(event) => {
              if (event.target.value === null) {
                return;
              }
              setCalculationFields((prevFields) => ({
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
              value={calculationFields.dilution || ''}
              variant="outlined"
              onChange={(event) => {
                if (event.target.value === null) {
                  return;
                }
                setCalculationFields((prevFields) => ({
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
              value={calculationFields.area_treated_sqm || ''}
              variant="outlined"
              onChange={(event) => {
                if (event.target.value === null) {
                  return;
                }
                setCalculationFields((prevFields) => ({
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
              value={calculationFields.delivery_rate_of_mix || ''}
              variant="outlined"
              onChange={(event) => {
                if (event.target.value === null) {
                  return;
                }
                setCalculationFields((prevFields) => ({
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
              value={calculationFields.application_rate || ''}
              variant="outlined"
              onChange={(event) => {
                if (event.target.value === null) {
                  return;
                }
                setCalculationFields((prevFields) => ({
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
            setHerbicidesArr((prevArr) => {
              const newHerbicidesArr = [...prevArr];
              newHerbicidesArr.splice(key, 1);
              return newHerbicidesArr;
            });
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
