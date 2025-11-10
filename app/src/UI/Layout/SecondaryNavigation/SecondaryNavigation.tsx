import { useSelector } from 'react-redux';
import { selectUserSettings } from 'state/reducers/userSettings';
import { Box, Container, Stack } from '@mui/material';
import { NavLink, To } from 'react-router';
import React from 'react';
import './SecondaryNavigation.css';

interface SecondaryNavigationLinkDefinition {
  label: string;
  to: To;
}

interface SecondaryNavigationProps {
  links: SecondaryNavigationLinkDefinition[];
}

const SecondaryNavigation: React.FC<SecondaryNavigationProps> = ({ links }) => {
  const { darkTheme } = useSelector(selectUserSettings);

  return (
    <Box className={`secondary-navigation ${darkTheme ? 'dark' : ''}`}>
      <Container maxWidth={'lg'}>
        <Stack direction="row" justifyContent="start" alignItems="center" spacing={6}>
          {links.map((l) => (
            <NavLink key={l.label} to={l.to} className={({ isActive }) => (isActive ? 'active' : '')}>
              {l.label}
            </NavLink>
          ))}
        </Stack>
      </Container>
    </Box>
  );
};

export default SecondaryNavigation;
export type { SecondaryNavigationProps, SecondaryNavigationLinkDefinition };
