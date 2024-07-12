import { Typography, Box, TextField, Button, Tooltip } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { IInvasivePlant } from '../../Models';
import CustomAutoComplete from '../../CustomAutoComplete';
import { ChemicalTreatmentDetailsContext } from '../../ChemicalTreatmentDetailsContext';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import { RENDER_DEBUG } from 'UI/App';

export interface IInvasivePlantComponent {
  index: number;
  species: any;
  key?: number;
  classes?: any;
}

const InvasivePlant: React.FC<IInvasivePlantComponent> = ({ index, species, classes }) => {
  const ref = useRef(0);
  ref.current += 1;
  if (RENDER_DEBUG) { console.log('%cInvasivePlant:' + ref.current.toString(), 'color: yellow'); }
  const formDataContext = useContext(ChemicalTreatmentDetailsContext);
  const { formDetails, setFormDetails } = formDataContext;

  const businessCodes = formDetails.businessCodes;

  const invasivePlantsArr = formDetails.form_data.invasive_plants;

  const [currentInvasivePlant, setCurrentInvasivePlant] = useState<IInvasivePlant>(
    formDetails.form_data.invasive_plants[index]
  );

  //creating valueLabels to to get the lable for heading
  let optionValueLabels = {};
  if (formDetails.activitySubType.toLowerCase().includes('aquatic')) {
    Object.values(businessCodes['invasive_plant_aquatic_code'] as any[]).forEach((option) => {
      optionValueLabels[option.value] = option.label || option.title || option.value;
    });
  } else {
    Object.values(businessCodes['invasive_plant_code'] as any[]).forEach((option) => {
      optionValueLabels[option.value] = option.label || option.title || option.value;
    });
  }

  const handleRemoveInvasivePlant = () => (
    setFormDetails((prevDetails) => {
      let newSpeciesArr = JSON.parse(JSON.stringify([...prevDetails.form_data.invasive_plants]))
      newSpeciesArr.splice(index, 1);
      newSpeciesArr.forEach((item, i) => item.index = i);

      if (newSpeciesArr.length === 1) {
        newSpeciesArr[0].percent_area_covered = 100;
      }

      return {
        ...prevDetails,
        form_data: {
          ...prevDetails.form_data,
          invasive_plants: newSpeciesArr
        }
      };
    })
  )
  //update this invasive plant inside invasive plants arr
  useEffect(() => {
    if (currentInvasivePlant !== species) {
      setFormDetails((prevDetails) => {
        const newSpeciesArr = [...prevDetails.form_data.invasive_plants];
        newSpeciesArr[index] = currentInvasivePlant;
        return {
          ...prevDetails,
          form_data: {
            ...prevDetails.form_data,
            invasive_plants: newSpeciesArr
          }
        };
      });
    }
  }, [currentInvasivePlant]);

  return (
    <div className={'invasive_plant'}>
      <Tooltip classes={{ tooltip: 'toolTip' }}
        placement="left" title="Target invasive plant species at this location"
        style={{
          float: 'right',
          marginBottom: 5,
          color: 'rgb(170, 170, 170)',
          display: invasivePlantsArr.length < 2 ? 'none' : 'block'
        }}
      >
        <HelpOutlineIcon />
      </Tooltip>
      <CustomAutoComplete
        choices={
          formDetails.activitySubType.toLowerCase().includes('aquatic')
            ? businessCodes['invasive_plant_aquatic_code']
            : businessCodes['invasive_plant_code']
        }
        disabled={formDetails.disabled}
        className={'inputField'}
        actualValue={species.invasive_plant_code}
        id={'invasive_plant_code'}
        label={'Invasive Plant'}
        onChange={(event, value) => {
          if (value === null) {
            return;
          }
          setCurrentInvasivePlant((prevInvasivePlant) => {
            return { ...prevInvasivePlant, invasive_plant_code: (value as any).value };
          });
        }}
        parentState={{ species, setCurrentInvasivePlant }}
      />

      <div className={'invasive_plant_tooltip'}>
        <Tooltip
          style={{
            float: 'right',
            marginBottom: 5,
            color: 'rgb(170, 170, 170)',
            display: invasivePlantsArr.length < 2 ? 'none' : 'block'
          }}
          placement="left"
          title="Percent of area covered by this species">
          <HelpOutlineIcon />
        </Tooltip>
      </div>
      <TextField
        fullWidth
        disabled={formDetails.disabled}
        style={{ display: invasivePlantsArr.length < 2 ? 'none' : 'flex' }}
        type="number"
        value={species.percent_area_covered}
        label="Percent Area Covered (%)"
        variant="outlined"
        onChange={(event) => {
          if (event.target.value === null) {
            return;
          }
          setCurrentInvasivePlant((prevInvasivePlant) => ({
            ...prevInvasivePlant,
            percent_area_covered: Number(event.target.value)
          }));
        }}
        defaultValue={undefined}
      />

      <div
        className={'removeInvasivePlantButton'}>
        <Button
          disabled={formDetails.disabled}
          onClick={handleRemoveInvasivePlant}
          variant="contained"
          startIcon={<DeleteIcon />}
          color="secondary">
          Remove Invasive Plant
        </Button>
      </div>
    </div>
  );
};

export default InvasivePlant;
