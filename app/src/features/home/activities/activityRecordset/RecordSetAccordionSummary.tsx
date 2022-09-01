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
import React, { useContext, useState } from 'react';
import LayersIcon from '@mui/icons-material/Layers';
// Commented out due to module not being found, not sure what this is supposed to be
// import Reorderer from 'reorderer';
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import DownloadIcon from '@mui/icons-material/Download';
import GrassIcon from '@mui/icons-material/Grass';
import { GeneralDialog, IGeneralDialog } from 'components/dialog/GeneralDialog';
import SaveIcon from '@mui/icons-material/Save';
import RecordSetDeleteDialog from './RecordSetDeleteDialog';
import { getSearchCriteriaFromFilters } from '../../../../components/activities-list/Tables/Plant/ActivityGrid';
import { useDataAccess } from 'hooks/useDataAccess';
import { useDispatch, useSelector } from 'react-redux';
import { selectAuth } from 'state/reducers/auth';
import { selectConfiguration } from 'state/reducers/configuration';
import { USER_SETTINGS_ADD_BOUNDARY_TO_SET_REQUEST, USER_SETTINGS_REMOVE_RECORD_SET_REQUEST } from 'state/actions';
import { selectUserSettings } from 'state/reducers/userSettings';

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
  const [newName, setNewName] = useState(props.recordSetName);
  const [nameEdit, setNameEdit] = useState(false);

  const [recordSetsToDelete, setRecordSetsToDelete] = useState([]);
  const [recordSetDeleteDialogOpen, setRecordSetDeleteDialogOpen] = useState(false);
  const [recordSetDeleteDialogLoading, setRecordSetDeleteDialogLoading] = useState(false);
  const { accessRoles } = useSelector(selectAuth);
  const { MOBILE } = useSelector(selectConfiguration);
  const userSettings = useSelector(selectUserSettings);
  const dataAccess = useDataAccess();
  const dispatch = useDispatch();

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
    dialogContentText: ''
  });

  const openDeleteDialog = async () => {
    const recordSets = [];
    const filter = await getSearchCriteriaFromFilters(
      userSettings.recordSets[props.setName].advancedFilters,
      accessRoles,
      userSettings.recordSets,
      props.recordSetName,
      false,
      null,
      0,
      1000
    );
    console.log('Filter: ', filter);
    const activityList = await dataAccess.getActivities(filter);
    console.log('Got activities list: ', activityList);
    recordSets.push({
      recordSetName: props.recordSetName,
      activities: activityList
    });
    setRecordSetsToDelete(recordSets);
    setRecordSetDeleteDialogOpen(true);
  };

  const handleCachedActivityDelete = async () => {
    try {
      console.log('RecordSetsToDelete: ', recordSetsToDelete);
      for (const activity of recordSetsToDelete[0].activities.rows) {
        console.log('Attempting to delete activity: ' + activity.activity_id);
        const response = await dataAccess.deleteActivityFromCache(activity.activity_id);
        console.log('Response from delete ' + activity.activity_id + ': ', response);
      }
    } catch (e) {
      console.log('Error deleting cached activities: ', e);
    } finally {
      setRecordSetDeleteDialogOpen(false);
    }
  };

  const handleFilterSetDelete = async (recordSetName: string) => {
    console.log('Deleting filter set');
    if (
      /*eslint-disable*/
      confirm(
        'Are you sure you want to remove this record set?  The data will persist but you will no longer have this set of filters or the map layer.'
      )
    ) {
      // props.remove(recordSetName);
      dispatch({
        type: USER_SETTINGS_REMOVE_RECORD_SET_REQUEST,
        payload: {
          recordSetName: recordSetName
        }
      });
      setRecordSetDeleteDialogOpen(false);
    }
  };

  // return useMemo(() => {
  return (
    <>
      <RecordSetDeleteDialog
        platform={MOBILE ? 'mobile' : 'web'}
        isOpen={recordSetDeleteDialogOpen}
        isLoading={recordSetDeleteDialogLoading}
        handleClose={async () => {
          setRecordSetDeleteDialogOpen(false);
        }}
        handleCachedActivityDelete={async () => {
          handleCachedActivityDelete();
        }}
        handleFilterSetDelete={async () => {
          handleFilterSetDelete(props.setName);
        }}
        recordSets={recordSetsToDelete}
      />
      <AccordionSummary>
        <Box sx={{ pl: 5, flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          {MOBILE && props.recordSetName !== 'My Drafts' && (
            <Button
              sx={{ mr: 2 }}
              variant="outlined"
              onClick={(e) => {
                e.stopPropagation();
              }}>
              <Checkbox
                checked={props.isSelected}
                onChange={(e) => {
                  e.stopPropagation();
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
                      if (props.recordSetName === "New Record Set") {
                        setNewName("");
                      } else {
                        setNewName(props.recordSetName);
                      }
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
                value={newName || ''}
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
                  setNameEdit(false);
                }}
                variant="contained">
                Submit
              </Button>
              <Button
                sx={{ ml: 7 }}
                onClick={(e) => {
                  e.stopPropagation();
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
            Boundary Filter
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
                openDeleteDialog();
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
                  // props.remove(props.setName);
                  dispatch({
                    type: USER_SETTINGS_REMOVE_RECORD_SET_REQUEST,
                    payload: {
                      recordSetName: props.setName
                    }
                  });
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
              dispatch({ type: USER_SETTINGS_ADD_BOUNDARY_TO_SET_REQUEST, payload: { boundary: e.target?.value, setName: props?.setName }});
              setBoundaryFilterDialog({ ...boundaryFilterDialog, dialogOpen: false });
            }}
            value={userSettings.recordSets[props?.setName]?.searchBoundary ? JSON.stringify(userSettings.recordSets[props?.setName]?.searchBoundary) : ''}>
            {userSettings.boundaries?.map((boundary) => {
              return (
                <MenuItem key={boundary?.id + Math.random()} value={JSON.stringify(boundary) || ' '}>
                  {boundary?.name}
                </MenuItem>
              );
            })}
          </Select>
        </GeneralDialog>
      </AccordionSummary>
    </>
  );
  // }, [JSON.stringify({ expanded: expanded, mapToggle: mapToggle, colour: colour, recordSetName: recordSetName })]);
  // }, [newName, setNewName, nameEdit, setNameEdit]); // todo - only check if number of record sets, or one of their header button or properties needs to re render
};

export default RecordSetAccordionSummary;
