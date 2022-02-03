import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import makeStyles from '@mui/styles/makeStyles';
import { useKeycloak } from '@react-keycloak/web';
import { DocType } from 'constants/database';
import React, { useContext, useEffect, useState } from 'react';
import BatchUpload from '../../components/batch-upload/BatchUpload';
import { DatabaseContext, query, QueryType } from '../../contexts/DatabaseContext';
import PlantBiocontrolTable from './Tables/Plant/PlantBiocontrolTable';
import PlantMonitoringsTable from './Tables/Plant/PlantMonitoringsTable';
import PlantTransectsTable from './Tables/Plant/PlantTransectsTable';
import PlantTreatmentsTable from './Tables/Plant/PlantTreatmentsTable';
import PlantObservationsTable from './Tables/Plant/PlantObservationsTable';

const useStyles = makeStyles((theme: any) => ({
  newActivityButtonsRow: {
    '& Button': {
      marginRight: '0.5rem',
      marginBottom: '0.5rem'
    }
  },
  syncSuccessful: {
    color: theme.palette.success.main
  },
  formControl: {
    marginRight: 20,
    minWidth: 150
  }
}));

const ActivitiesList2: React.FC = () => {
  const classes = useStyles();

  const databaseContext = useContext(DatabaseContext);
  const { keycloak } = useKeycloak();
  const [workflowFunction, setWorkflowFunction] = useState('Plant');

  useEffect(() => {
    const userId = async () => {
      const userInfo: any = keycloak
        ? keycloak?.userInfo
        : await databaseContext.asyncQueue({
            asyncTask: () => {
              return query({ type: QueryType.DOC_TYPE_AND_ID, docType: DocType.KEYCLOAK, ID: '1' }, databaseContext);
            }
          });

      return userInfo?.preferred_username;
    };
    if (!userId) throw "Keycloak error: can not get current user's username";
  }, []);

  const handleWorkflowFunctionChange = (event: any) => {
    setWorkflowFunction(event.target.value);
  };

  return (
    <>
      <Box>
        <Box mb={3} display="flex" justifyContent="space-between">
          <FormControl variant="outlined" className={classes.formControl}>
            <InputLabel>Workflow Functions</InputLabel>
            <Select value={workflowFunction} onChange={handleWorkflowFunctionChange} label="Select Form Type">
              <MenuItem value="Plant">Plant</MenuItem>
              <MenuItem value="Animal">Animal</MenuItem>
              <MenuItem value="FREP">FREP</MenuItem>
              <MenuItem value="Review">Review</MenuItem>
              <MenuItem value="Past Activities">Past Activities</MenuItem>
              <MenuItem value="Batch Upload">Batch Upload</MenuItem>
              <MenuItem value="IAPP Data">IAPP Data</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <Box>
          {workflowFunction === 'Plant' && (
            <Box>
              <PlantObservationsTable />
              <PlantTreatmentsTable />
              <PlantBiocontrolTable />
              <PlantMonitoringsTable />
              <PlantTransectsTable />
            </Box>
          )}
          {workflowFunction === 'Animal' && <Box></Box>}
          {workflowFunction === 'Review' && <Box></Box>}
          {workflowFunction === 'FREP' && <Box></Box>}
          {workflowFunction === 'Past Activities' && <Box></Box>}
          {workflowFunction === 'Batch Upload' && (
            <Box>
              <BatchUpload />
            </Box>
          )}
          {workflowFunction === 'IAPP Data' && <Box></Box>}
        </Box>
      </Box>
    </>
  );
};

export default ActivitiesList2;
