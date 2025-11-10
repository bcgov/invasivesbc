import { Box } from '@mui/material';
import React, { PropsWithChildren } from 'react';
import SecondaryNavigation, {
  SecondaryNavigationLinkDefinition
} from 'UI/Layout/SecondaryNavigation/SecondaryNavigation';

const AdminLayout: React.FC<PropsWithChildren> = ({ children }) => {
  const links: SecondaryNavigationLinkDefinition[] = [
    { to: '/Admin/accessRequests', label: 'Access Requests' },
    { to: '/Admin/roleAssignment', label: 'Role Assignments' },
    { to: '/Admin/emailSettings', label: 'Email Settings' },
    { to: '/Admin/emailTemplates', label: 'Email Templates' }
  ];
  return (
    <>
      <SecondaryNavigation links={links} />
      <Box sx={{ paddingTop: '2rem', marginBottom: '5rem' }}>{children}</Box>
    </>
  );
};

export default AdminLayout;
