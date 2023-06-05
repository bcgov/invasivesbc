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
import React, { useCallback, useEffect, useState } from 'react';

export interface IFilterDialog {
  dialogOpen: boolean;
  filterKey?: any;
  allFiltersBefore?: any[];
  setAllFilters?: React.Dispatch<React.SetStateAction<any[]>>;
  closeActionDialog?: () => void;
  setType?: string;
}

export const FilterDialog = (props: IFilterDialog) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(props.dialogOpen);
  }, [props.dialogOpen]);

  const choices = ['Jurisdiction', 'Species Positive', 'Species Negative', 'Metabase Report ID'];

  const [jurisdictionOptions, setJurisdictionOptions] = useState({});
  const [speciesPOptions, setSpeciesPOptions] = useState({});
  const [speciesNOptions, setSpeciesNOptions] = useState({});

  // const speciesPOptions = { Blueweed: 'Blueweed', Cheatgrass: 'Cheatgrass' };
  // const speciesNOptions = { Blueweed: 'Blueweed', Cheatgrass: 'Cheatgrass' };
  const invasivesApi = useInvasivesApi();
  const { fetchCodeTable, getIappJurisdictions } = invasivesApi;

  const [choice, setChoice] = useState('Jurisdiction');
  const [subChoices, setSubChoices] = useState({ ...jurisdictionOptions });
  const [subChoice, setSubChoice] = useState(null);

  /*
  const getSpeciesOptions = useCallback(async () => {

      
    const dataTerrestial = await fetchCodeTable('invasive_plant_code');
    const dataAquatic = await fetchCodeTable('invasive_plant_aquatic_code');
    const data = [...dataTerrestial, ...dataAquatic];

    return data;
  },[choice]);
  */

  const getSpeciesOptions = async () => {
    const dataTerrestial = await fetchCodeTable('invasive_plant_code');
    const dataAquatic = await fetchCodeTable('invasive_plant_aquatic_code');
    const data = [...dataTerrestial, ...dataAquatic];

    return data;
  };

  useEffect(() => {
    let isMounted = true;
    if (props.filterKey !== undefined && props.allFiltersBefore !== undefined) {
      const prevChoices = props.allFiltersBefore.filter((f) => {
        return f.filterKey === props.filterKey;
      })[0];
      setChoice(prevChoices.filterField);
      setSubChoice(prevChoices.filterValue);
    }

    const getJurisdictionOptions = async () => {
      const data = props.setType === 'POI' ? await getIappJurisdictions() : await fetchCodeTable('jurisdiction_code');
      return data;
    };

    getJurisdictionOptions().then((data) => {
      if (isMounted) {
        setJurisdictionOptions((prev) => {
          const newOptions = {};
          data.forEach((d, i) => {
            if (props.setType === 'POI') {
              // separate because codes are currently null for iapp records
              newOptions[i] = d.description;
            } else {
              newOptions[d.code] = d.description;
            }
          });
          return newOptions;
        });
      }
    });


    return () => {
      isMounted = false;
    };
  }, [props.setType]);


  const setSpeciesOptions = () => {
          getSpeciesOptions()
            .then((data) => {
              console.log('oh boy');
              console.dir(data);
              setSpeciesPOptions((prev) => {
                const newOptions = {};
                data?.forEach((d) => {
                  newOptions[d.code] = d.description;
                });
                if(choice === 'Species Positive')
                {
                  setSubChoices({ ...newOptions });
                }
                return newOptions;
              });

              setSpeciesNOptions((prev) => {
                const newOptions = {};
                data.forEach((d) => {
                  newOptions[d.code] = d.description;
                if(choice === 'Species Negative')
                {
                  setSubChoices({ ...newOptions });
                }
                });
                return newOptions;
              });
            })

  }

  useEffect(() => {
    switch (choice) {
      case 'Jurisdiction':
        setSubChoices({ ...jurisdictionOptions });
        // setSubChoice(null);
        break;
      case 'Species Positive':
        setSpeciesOptions()
        // setSubChoice(null);
        break;
      case 'Species Negative':
        setSpeciesOptions()
        //setSubChoices({ ...speciesNOptions });
        // setSubChoice(null);
        break;
      case 'Metabase Report ID':
        setSubChoices({ ...speciesNOptions });
        // setSubChoice(null);
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
          <SubChoiceDropDown choice={subChoice} choices={subChoices} setChoice={setSubChoice} />
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
                {
                  filterField: choice,
                  filterValue: { [subChoice]: subChoices[subChoice] },
                  filterKey: choice + subChoice
                }
              ]);
            } else if (props.allFiltersBefore && props.allFiltersBefore.length > 0 && props.filterKey) {
              props.setAllFilters([
                ...props.allFiltersBefore.filter((f) => {
                  return f.filterKey !== props.filterKey;
                }),
                {
                  filterField: choice,
                  filterValue: { [subChoice]: subChoices[subChoice] },
                  filterKey: choice + subChoice
                }
              ]);
            } else
              props.setAllFilters([
                {
                  filterField: choice,
                  filterValue: { [subChoice]: subChoices[subChoice] },
                  filterKey: choice + subChoice
                }
              ]);

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
            if (c) {
              return <MenuItem value={c}>{c}</MenuItem>;
            } else {
              return null;
            }
          })
        ) : (
          <></>
        )}
      </Select>
    </>
  );
};

const SubChoiceDropDown = (props) => {
  return (
    <Select
      sx={{ minWidth: 150, mt: 3, mb: 3 }}
      onChange={(e) => {
        props.setChoice(e.target.value);
      }}
      value={props.choice}>
      {props.choices ? (
        Object.keys(props.choices).map((ikey) => {
          return <MenuItem value={ikey}>{props.choices[ikey]}</MenuItem>;
        })
      ) : (
        <></>
      )}
    </Select>
  );
};

export const FilterDialogMemo = React.memo(FilterDialog, (prevProps, nextProps) => {
  return JSON.stringify(prevProps) === JSON.stringify(nextProps);
}); // (prevProps, nextProps) => JSON.stringify(prevProps) === JSON.stringify(nextProps
