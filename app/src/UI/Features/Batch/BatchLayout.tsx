import { Box, Container, Stack } from '@mui/material';
import { NavLink } from 'react-router';
import { useSelector } from 'react-redux';
import { selectUserSettings } from 'state/reducers/userSettings';
import 'UI/Features/Batch/Batch.css';

const BatchLayout = ({ children }) => {
  const { darkTheme } = useSelector(selectUserSettings);
  return (
    <>
      <Box className={`batchNav ${darkTheme ? 'batchDarkNav' : ''}`}>
        <Container maxWidth={'lg'}>
          <Stack direction="row" justifyContent="start" alignItems="center" spacing={6}>
            <NavLink to={'/Batch/list'} className={({ isActive }) => (isActive ? 'current_batch_link' : '')}>
              My Batches
            </NavLink>
            <NavLink to={'/Batch/new'} className={({ isActive }) => (isActive ? 'current_batch_link' : '')}>
              Create New
            </NavLink>
            <NavLink to={'/Batch/templates'} className={({ isActive }) => (isActive ? 'current_batch_link' : '')}>
              Templates
            </NavLink>
          </Stack>
        </Container>
      </Box>

      <Box sx={{ paddingTop: '2rem', marginBottom: '5rem' }}>{children}</Box>
    </>
  );
};

export default BatchLayout;
