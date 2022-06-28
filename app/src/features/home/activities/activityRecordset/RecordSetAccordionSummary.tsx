import { Delete, ExpandLess } from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  AccordionActions,
  AccordionSummary,
  Box,
  Button,
  Checkbox,
  Container,
  IconButton,
  MenuItem,
  Select,
  TextField,
  Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ColorLensIcon from '@mui/icons-material/ColorLens';
import React, { useState } from 'react';
import LayersIcon from '@mui/icons-material/Layers';
// Commented out due to module not being found, not sure what this is supposed to be
// import Reorderer from 'reorderer';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { RecordSetContext } from 'contexts/recordSetContext';
import DownloadIcon from '@mui/icons-material/Download';
import GrassIcon from '@mui/icons-material/Grass';
import { GeneralDialog, IGeneralDialog } from 'components/dialog/GeneralDialog';
import { Capacitor } from '@capacitor/core';
import SaveIcon from '@mui/icons-material/Save';

const isMobile = () => {
  // return Capacitor.getPlatform() !== 'web';
  return true;
};

const OrderSelector = (props) => {
  return (
    <Box sx={{ display: 'grid', height: 50, width: 100, pr: 5 }}>
      <IconButton
        size={'small'}
        sx={{ gridColumn: 1, gridRow: 1, justifySelf: 'center' }}
        onClick={(e) => {
          e.stopPropagation();
          props.moveUp();
        }}>
        <ArrowDropUpIcon />
      </IconButton>

      <IconButton
        size={'small'}
        sx={{ gridColumn: 1, gridRow: 2, pb: 5 }}
        onClick={(e) => {
          e.stopPropagation();
          props.moveDown();
        }}>
        <ArrowDropDownIcon />
      </IconButton>
      <Container sx={{ gridColumn: 2, alignContent: 'center', justifyContent: 'center' }}>
        <LayersIcon fontSize={'small'} />
        {props.drawOrder}
      </Container>
    </Box>
  );
};

const RecordSetAccordionSummary = (props) => {
  const recordSetContext = useContext(RecordSetContext);
  const [newName, setNewName] = useState(props.recordSetName);
  const [nameEdit, setNameEdit] = useState(false);

  const [boundaryFilterDialog, setBoundaryFilterDialog] = useState<IGeneralDialog>({
    dialogActions: [
      {
        actionName: 'Cancel',
        actionOnClick: async () => {
          setBoundaryFilterDialog({ ...boundaryFilterDialog, dialogOpen: false });
        }
      }
    ],
    dialogOpen: false,
    dialogTitle: 'Select boundary to filter: ',
    dialogContentText: null
  });

  // return useMemo(() => {
  return (
    <AccordionSummary>
      <Box sx={{ pl: 5, flexGrow: 1, display: 'flex', alignItems: 'center' }}>
        {isMobile() && props.recordSetName !== 'My Drafts' && (
          <Button
            sx={{ mr: 2 }}
            variant="outlined"
            onClick={(e) => {
              e.stopPropagation();
              console.log('Saving...');
            }}>
            <Checkbox
              checked={props.isSelected}
              onChange={(e) => {
                e.stopPropagation();
                console.log('Checkbox set to: ', e.target.checked);
                props.setIsSelected(e.target.checked);
              }}
            />
          </Button>
        )}
        {props.expanded ? <ExpandLess /> : <ExpandMoreIcon />}
        {props.recordSetType === 'POI' ? (
          <img src={process.env.PUBLIC_URL + '/assets/iapp.gif'} style={{ maxWidth: '4rem', margin: '0 0.5rem' }} />
        ) : (
          <GrassIcon style={{ margin: '0 0.5rem' }} />
        )}
        {!nameEdit && (
          <>
            <Typography>{props.recordSetName}</Typography>
            {props.canRemove && (
              <>
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setNameEdit(true);
                  }}
                  aria-label="delete">
                  <EditIcon style={{ paddingLeft: 5, fontSize: 20 }} />
                </IconButton>
              </>
            )}
          </>
        )}
        {nameEdit && (
          <>
            <TextField
              value={newName}
              onClick={(e) => {
                e.stopPropagation();
              }}
              onChange={(e) => {
                e.stopPropagation();
                setNewName(e.target.value);
              }}
              id="outlined-basic"
              label="New Record Set Name"
              variant="outlined"
            />
            <Button
              sx={{ ml: 7 }}
              onClick={(e) => {
                e.stopPropagation();
                props.setRecordSetName(newName);
                setNewName(props.recordSetName);
                setNameEdit(false);
              }}
              variant="contained">
              Submit
            </Button>
            <Button
              sx={{ ml: 7 }}
              onClick={(e) => {
                e.stopPropagation();
                setNewName(props.recordSetName);
                setNameEdit(false);
              }}
              variant="text">
              Cancel
            </Button>
          </>
        )}
      </Box>
      <AccordionActions sx={{ display: 'flex', justifyContent: 'end' }}>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            setBoundaryFilterDialog({ ...boundaryFilterDialog, dialogOpen: true });
          }}
          variant="outlined">
          Filter by boundary shape
          <ArrowDropDownIcon />
        </Button>
        <Button
          //className={classes.mainHeader}
          onClick={(e) => {
            e.stopPropagation();
            const currentIndex = props.colours.indexOf(props.color);
            const nextIndex = (currentIndex + 1) % props.colours.length;
            props.setColor(props.colours[nextIndex]);
          }}
          style={{ backgroundColor: props.color }}
          variant="contained">
          <ColorLensIcon />
        </Button>
        <Button onClick={(e) => e.stopPropagation()} variant="outlined">
          <LayersIcon />
          <Checkbox
            style={{ height: 15 }}
            checked={props.mapToggle}
            onChange={(e) => {
              e.stopPropagation();
              props.setMapToggle((prev) => !prev);
            }}
          />
        </Button>
        <OrderSelector moveUp={props.moveUp} moveDown={props.moveDown} drawOrder={props.drawOrder} />{' '}
        {props.canRemove ? (
          <Button
            onClick={(e) => {
              e.stopPropagation();
              if (
                /*eslint-disable*/
                confirm(
                  'Are you sure you want to remove this record set?  The data will persist but you will no longer have this set of filters or the map layer.'
                )
              ) {
                props.remove(props.setName);
              }
            }}
            style={{ justifySelf: 'end', alignSelf: 'right' }}
            variant="outlined">
            <Delete />
          </Button>
        ) : (
          <></>
        )}
        {props.canRemove ? (
          <Button
            disabled={true}
            onClick={(e) => {
              e.stopPropagation();
              if (
                /*eslint-disable*/
                confirm(
                  'Are you sure you want to remove this record set?  The data will persist but you will no longer have this set of filters or the map layer.'
                )
              ) {
                props.remove(props.setName);
              }
            }}
            style={{ justifySelf: 'end', alignSelf: 'right' }}
            variant="outlined">
            <DownloadIcon />
          </Button>
        ) : (
          <></>
        )}
      </AccordionActions>
      <GeneralDialog
        dialogOpen={boundaryFilterDialog.dialogOpen}
        dialogTitle={boundaryFilterDialog.dialogTitle}
        dialogActions={boundaryFilterDialog.dialogActions}
        dialogContentText={boundaryFilterDialog.dialogContentText}>
        <Select
          sx={{ minWidth: 150, m: 3 }}
          onChange={(e) => {
            e.stopPropagation();
            //add to the recordset filters
            recordSetContext.addBoundaryToSet(e.target?.value, props?.setName);
            setBoundaryFilterDialog({ ...boundaryFilterDialog, dialogOpen: false });
          }}>
          {recordSetContext.boundaries?.map((boundary) => {
            return (
              <MenuItem key={boundary.id} value={boundary}>
                {boundary.name}
              </MenuItem>
            );
          })}
        </Select>
      </GeneralDialog>
    </AccordionSummary>
  );
  // }, [JSON.stringify({ expanded: expanded, mapToggle: mapToggle, colour: colour, recordSetName: recordSetName })]);
  // }, [newName, setNewName, nameEdit, setNameEdit]); // todo - only check if number of record sets, or one of their header button or properties needs to re render
};

export default RecordSetAccordionSummary;
