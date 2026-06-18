import { Box } from '@mui/material';
import 'UI/Features/Batch/Batch.css';
import SecondaryNavigation, {
  SecondaryNavigationLinkDefinition
} from 'UI/Layout/SecondaryNavigation/SecondaryNavigation';

const BatchLayout = ({ children }) => {
  const links: SecondaryNavigationLinkDefinition[] = [
    { to: '/Batch/list', label: 'My Batches' },
    { to: '/Batch/new', label: 'Create New' },
    { to: '/Batch/templates', label: 'Templates' },
    { to: '/Batch/codes', label: 'Code Tables' }
  ];
  return (
    <>
      <SecondaryNavigation links={links} />

      <Box sx={{ paddingTop: '2rem', marginBottom: '5rem' }}>{children}</Box>
    </>
  );
};

export default BatchLayout;
