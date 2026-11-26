import { useSelector } from 'react-redux';
import { Box, Container, Stack } from '@mui/material';
import { NavLink, To } from 'react-router';
import React from 'react';
import { selectUserSettings } from 'state/reducers/userSettings';
import './SecondaryNavigation.css';
import { FeatureGated } from 'UI/Reusable/Predicates/FeatureGated';
import { FeatureFlags } from 'state/configuration/feature-flags';

interface SecondaryNavigationLinkDefinition {
  label: string;
  to: To;
  featureFlag?: keyof FeatureFlags;
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
          {links.map((l) =>
            l.featureFlag ? (
              <FeatureGated requires={l.featureFlag}>
                <NavLink key={l.label} to={l.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                  {l.label}
                </NavLink>
              </FeatureGated>
            ) : (
              <NavLink key={l.label} to={l.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                {l.label}
              </NavLink>
            )
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default SecondaryNavigation;
export type { SecondaryNavigationProps, SecondaryNavigationLinkDefinition };
