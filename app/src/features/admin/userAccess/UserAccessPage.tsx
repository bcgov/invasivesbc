import { Capacitor } from '@capacitor/core';
import { AuthStateContext } from 'contexts/authStateContext';
import { useInvasivesApi } from 'hooks/useInvasivesApi';
import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  Button,
  Card,
  CardActions,
  CardContent,
  Container,
  Divider,
  FormControlLabel,
  FormLabel,
  Grid,
  Radio,
  RadioGroup,
  TextField,
  FormControl,
  MenuItem,
  Typography,
  Tooltip,
  makeStyles,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody
} from '@material-ui/core';
import { DataGrid, GridColDef, GridValueGetterParams } from '@mui/x-data-grid';

interface IAccessRequestPage {
  classes?: any;
}

const UserAccessPage: React.FC<IAccessRequestPage> = (props) => {
  const history = useHistory();
  const api = useInvasivesApi();
  const authState = useContext(AuthStateContext);
  // const [users, setUsers] = useState<any[]>([]);
  const [rows, setRows] = useState<any[]>([]);
  const [rowsLoaded, setRowsLoaded] = useState(false);

  useEffect(() => {
    api.getApplicationUsers().then((res) => {
      console.log(res);
      // setUsers(res);
      getRows(res);
    });
  }, []);

  const columns: GridColDef[] = [
    { field: 'id', headerName: 'ID', width: 10 },
    { field: 'firstName', headerName: 'First Name', width: 20 },
    { field: 'lastName', headerName: 'Last Name', width: 20 },
    { field: 'email', headerName: 'Email', width: 20 },
    { field: 'role', headerName: 'Role(s)', width: 30 }
  ];

  // Get table rows
  const getRows = async (users: any) => {
    const rows = [];
    console.log('Users: ', users);
    console.log('function triggered');
    for (let i = 0; i < users.length; i++) {
      console.log('Moving onto next user');
      let user = users[i];
      let roles = await api.getRolesForUser(user.user_id);
      let roleNames = roles.map((r) => r.name);
      console.log('Adding another row');
      rows.push({
        id: user.user_id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.preferred_email,
        role: roleNames.join(', ')
      });
    }
    console.log('Setting rows');
    setRows(rows);
    setRowsLoaded(true);
  };

  // const rows = [];

  const rolesList = [
    {
      name: 'Administrator - Plants Only',
      value: 'administrator_plants'
    },
    {
      name: 'Administrator - Animals Only',
      value: 'administrator_animals'
    },
    {
      name: 'BC Government Staff User - Animals',
      value: 'bcgov_staff_animals'
    },
    {
      name: 'BC Government Staff User - Plants',
      value: 'bcgov_staff_plants'
    },
    {
      name: 'BC Government Staff User - Both',
      value: 'bcgov_staff_both'
    },
    {
      name: 'Contractor Manager - Animals',
      value: 'contractor_manager_animals'
    },
    {
      name: 'Contractor Manager - Plants',
      value: 'contractor_manager_plants'
    },
    {
      name: 'Contractor Manager - Both',
      value: 'contractor_manager_both'
    },
    {
      name: 'Contractor Staff - Animals',
      value: 'contractor_staff_animals'
    },
    {
      name: 'Contractor Staff - Plants',
      value: 'contractor_staff_plants'
    },
    {
      name: 'Contractor Staff - Both',
      value: 'contractor_staff_both'
    },
    {
      name: 'Indigenous/Local Gov/RISO Manager - Animals',
      value: 'indigenous_riso_manager_animals'
    },
    {
      name: 'Indigenous/Local Gov/RISO Manager - Plants',
      value: 'indigenous_riso_manager_plants'
    },
    {
      name: 'Indigenous/Local Gov/RISO Manager - Both',
      value: 'indigenous_riso_manager_both'
    },
    {
      name: 'Indigenous/Local Gov/RISO Staff - Animals',
      value: 'indigenous_riso_staff_animals'
    },
    {
      name: 'Indigenous/Local Gov/RISO Staff - Plants',
      value: 'indigenous_riso_staff_plants'
    },
    {
      name: 'Indigenous/Local Gov/RISO Staff - Both',
      value: 'indigenous_riso_staff_both'
    },
    {
      name: 'Master Administrator',
      value: 'master_administrator'
    }
  ];

  return (
    <Container className={props.classes.container}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Typography variant="h4" align="center">
            Grant or Revoke Roles
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Card elevation={8}>
            <CardContent>
              <Grid container direction="row" spacing={5} justifyContent="space-between">
                <Grid item>
                  {rowsLoaded && (
                    <DataGrid rows={rows} columns={columns} pageSize={5} rowsPerPageOptions={[5]} checkboxSelection />
                  )}
                </Grid>
              </Grid>
            </CardContent>
            <Divider />
            <CardActions>
              <Grid container direction="row" spacing={5} justifyContent="space-between">
                <Grid item>
                  <Button variant="contained" color="primary">
                    Save Changes
                  </Button>
                </Grid>
              </Grid>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default UserAccessPage;
