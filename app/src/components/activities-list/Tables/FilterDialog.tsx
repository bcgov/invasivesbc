import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  MenuItem,
  Select
} from '@mui/material';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import React, { useEffect, useState } from 'react';

export interface IFilterDialog {
  dialogOpen: boolean;
  filterKey?: any;
  allFiltersBefore?: any[];
  setAllFilters?: React.Dispatch<React.SetStateAction<any[]>>;
  closeActionDialog?: () => void;
}

export const FilterDialog = (props: IFilterDialog) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(props.dialogOpen);
  }, [props.dialogOpen]);

  const choices = ['Jurisdiction', 'Species Positive', 'Species Negative', 'Metabase Report ID'];

  const [jurisdictionOptions, setJurisdictionOptions] = useState([]);

  const speciesPOptions = ['Blueweed', 'Cheatgrass'];
  const speciesNOptions = ['Blueweed', 'Cheatgrass'];
  const invasivesApi = useInvasivesApi();
  const { fetchCodeTable } = invasivesApi;

  const [choice, setChoice] = useState('Jurisdiction');
  const [subChoices, setSubChoices] = useState([...jurisdictionOptions]);
  const [subChoice, setSubChoice] = useState(
    'Ministry of Forests, Lands, Natural Resource Operations & Rural Development'
  );

  useEffect(() => {
    if (props.filterKey !== undefined && props.allFiltersBefore !== undefined) {
      const prevChoices = props.allFiltersBefore.filter((f) => {
        return f.filterKey === props.filterKey;
      })[0];
      setChoice(prevChoices.filterField);
      setSubChoice(prevChoices.filterValue);
    }

    const getJurisdictionOptions = async () => {
      console.log('running');
      const data = await fetchCodeTable('42');
      setJurisdictionOptions(data);
    };

    getJurisdictionOptions();
  }, []);

  useEffect(() => {
    switch (choice) {
      case 'Jurisdiction':
        setSubChoices(
          jurisdictionOptions.map((jur) => {
            console.log(jur);
            return jur.description;
          })
        );
        setSubChoice('BC Hydro');
        break;
      case 'Species Positive':
        setSubChoices([...speciesPOptions]);
        setSubChoice('Blueweed');
        break;
      case 'Species Negative':
        setSubChoices([...speciesNOptions]);
        setSubChoice('Cheatgrass');
        break;
      case 'Metabase Report ID':
        setSubChoices([...speciesNOptions]);
        setSubChoice('Cheatgrass');
        break;
    }
  }, [choice, jurisdictionOptions]);

  return (
    <Dialog open={open} aria-labelledby="alert-dialog-title" aria-describedby="alert-dialog-description">
      <DialogTitle id="alert-dialog-title">Edit custom filter</DialogTitle>
      <DialogContent>
        <DialogContentText>Choose an inclusive filter:</DialogContentText>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'space-around'
          }}>
          <DropDown choice={choice} choices={choices} setChoice={setChoice} />
          <ArrowDownwardIcon />
          <DropDown choice={subChoice} choices={subChoices} setChoice={setSubChoice} />
        </Box>
      </DialogContent>
      <DialogActions sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          onClick={() => {
            props.closeActionDialog();
          }}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={() => {
            if (props.allFiltersBefore && props.allFiltersBefore.length > 0 && !props.filterKey) {
              props.setAllFilters([
                ...props.allFiltersBefore.filter((f) => {
                  return f.filterKey !== choice + subChoice;
                }),
                { filterField: choice, filterValue: subChoice, filterKey: choice + subChoice }
              ]);
            } else if (props.allFiltersBefore && props.allFiltersBefore.length > 0 && props.filterKey) {
              props.setAllFilters([
                ...props.allFiltersBefore.filter((f) => {
                  return f.filterKey !== props.filterKey;
                }),
                { filterField: choice, filterValue: subChoice, filterKey: choice + subChoice }
              ]);
            } else
              props.setAllFilters([{ filterField: choice, filterValue: subChoice, filterKey: choice + subChoice }]);

            props.closeActionDialog();
          }}>
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const DropDown = (props) => {
  return (
    <>
      <Select
        sx={{ minWidth: 150, mt: 3, mb: 3 }}
        onChange={(e) => {
          props.setChoice(e.target.value);
        }}
        value={props.choice}>
        {props.choices && props.choices.length > 0 ? (
          props.choices.map((c) => {
            return <MenuItem value={c}>{c}</MenuItem>;
          })
        ) : (
          <></>
        )}
      </Select>
    </>
  );
};
