import { AdminPanelSettings, Assessment, FileUpload, Home, Map, Newspaper, School } from '@mui/icons-material';
import ManageSearchIcon from '@mui/icons-material/ManageSearch';
import React, { ReactNode, useEffect } from 'react';
import { FeatureFlags } from 'state/configuration/feature-flags';
import { useSelector } from 'utils/use_selector';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { selectAuth } from 'state/reducers/auth';
import { matchPath, PathPattern, useLocation } from 'react-router';

enum LayoutMode {
  MAP_FOCUSED = 'map_focused',
  MAP_EXCLUSIVE = 'map_exclusive',
  MAP_HIDDEN = 'map_hidden'
}

enum TabPredicate {
  AUTHENTICATED_ANY = 'authenticated_any',
  AUTHENTICATED_ONLINE = 'authenticated_online',
  WORKING_OFFLINE = 'working_offline',
  UNAUTHENTICATED = 'unauthenticated',
  ALWAYS = 'always',
  NEVER = 'never'
}

enum PlatformPredicate {
  WEB = 'web',
  MOBILE = 'mobile',
  BOTH = 'both'
}

type PrimaryNavigationDescriptor = {
  id: string;
  path: string;
  label: string;
  predicate: TabPredicate;
  activePaths: PathPattern<string>[];
  platform: PlatformPredicate;
  layout: LayoutMode;
  icon: ReactNode;
  requiresFeature?: keyof FeatureFlags;
  requiresRole?: 'admin';
  requiresPermission?: string;
};

type PrimaryNavigationLink = PrimaryNavigationDescriptor & {
  active: boolean;
};

function usePrimaryNavigationLinks() {
  const activeActivity = useSelector((state) => state.UserSettings.activeActivity) || undefined;
  const activeIAPP = useSelector((state) => state.UserSettings.activeIAPP) || undefined;

  const authenticated = useSelector((state) => state.Auth.authenticated && state?.Auth.roles.length > 0);

  const isCellPhoneWidth = useSelector((state) => state.AppMode.constraints.tinyScreen);

  const { workingOffline, loggedInOrWorkingOffline } = useSelector(selectAuth);
  const { MOBILE } = useSelector((state) => state.Configuration.current.build);
  const { features } = useSelector((state) => state.Configuration.current);
  const roles = useSelector((state) => state.Auth.roles);

  const location = useLocation();
  const [filteredLinks, setFilteredLinks] = React.useState<PrimaryNavigationLink[]>([]);

  useEffect(() => {
    const filtered = PRIMARY_NAVIGATION_LINKS.filter((link) => {
      if (link.platform === PlatformPredicate.MOBILE && !MOBILE) {
        return false;
      }
      if (link.platform === PlatformPredicate.WEB && MOBILE) {
        return false;
      }

      if (link.requiresFeature !== undefined) {
        if (!features[link.requiresFeature].enabled) {
          return false;
        }
      }

      if (link.requiresRole && link.requiresRole == 'admin') {
        if (!roles.find((role) => role.role_id === 18)) return false;
      }

      switch (link.predicate) {
        case TabPredicate.ALWAYS:
          return true;
        case TabPredicate.NEVER:
          return false;
        case TabPredicate.UNAUTHENTICATED:
          return !loggedInOrWorkingOffline;
        case TabPredicate.AUTHENTICATED_ONLINE:
          return authenticated && !workingOffline;
        case TabPredicate.WORKING_OFFLINE:
          return workingOffline;
        case TabPredicate.AUTHENTICATED_ANY:
          return loggedInOrWorkingOffline;
      }
    });

    setFilteredLinks(
      filtered.map((link) => {
        return {
          ...link,
          active: link.activePaths.some((p) => matchPath(p, location.pathname) !== null)
        };
      })
    );
  }, [loggedInOrWorkingOffline, authenticated, location.pathname]);

  const PRIMARY_NAVIGATION_LINKS: PrimaryNavigationDescriptor[] = [
    {
      id: 'landing',
      path: '/Landing',
      activePaths: [{ path: '/Landing', caseSensitive: false }],
      predicate: TabPredicate.ALWAYS,
      platform: PlatformPredicate.BOTH,
      label: 'Home',
      layout: LayoutMode.MAP_HIDDEN,
      icon: <Home />
    },
    {
      id: 'records',
      path: '/Records',
      activePaths: [
        { path: '/Records', end: true },
        { path: '/Records/List/*', caseSensitive: false, end: true }
      ],
      label: 'Records',
      predicate: TabPredicate.AUTHENTICATED_ANY,
      platform: PlatformPredicate.BOTH,
      layout: LayoutMode.MAP_FOCUSED,
      icon: <ManageSearchIcon />
    },
    {
      id: 'activity',
      path: `/Records/Activity/${activeActivity}/form`,
      activePaths: [{ path: '/Records/Activity/:id/*', end: true }],
      label: isCellPhoneWidth ? 'Activity' : 'Current Activity',
      predicate: TabPredicate.AUTHENTICATED_ANY,
      platform: PlatformPredicate.BOTH,
      layout: LayoutMode.MAP_FOCUSED,
      icon: <AssignmentIcon />
    },
    {
      id: 'iapp',
      path: `/Records/IAPP/${activeIAPP}/summary`,
      activePaths: [{ path: '/Records/IAPP/:id/*', end: true }],
      label: isCellPhoneWidth ? 'IAPP' : 'Current IAPP',
      predicate: TabPredicate.AUTHENTICATED_ANY,
      platform: PlatformPredicate.BOTH,
      layout: LayoutMode.MAP_FOCUSED,
      icon: (
        <img
          alt="iapp logo"
          className="iapp-logo"
          src={'/assets/iapp_logo.gif'}
          style={{ maxWidth: '1rem', marginBottom: '0px' }}
        />
      )
    },
    {
      id: 'list',
      path: '/Batch/list',
      activePaths: [
        { path: '/Batch', end: true },
        { path: '/Batch/*', end: true }
      ],
      label: 'Batch',
      requiresFeature: 'BATCH',
      predicate: TabPredicate.AUTHENTICATED_ONLINE,
      platform: PlatformPredicate.WEB,
      layout: LayoutMode.MAP_HIDDEN,
      icon: <FileUpload />
    },
    {
      id: 'admin',
      path: '/Admin/accessRequests',
      activePaths: [{ path: '/Admin' }, { path: '/Admin/*' }],
      label: 'Admin',
      predicate: TabPredicate.ALWAYS,
      platform: PlatformPredicate.WEB,
      layout: LayoutMode.MAP_HIDDEN,
      icon: <AdminPanelSettings />,
      requiresRole: 'admin'
    },
    {
      id: 'reports',
      path: '/Reports',
      activePaths: [{ path: '/Reports' }],
      label: 'Reports',
      requiresFeature: 'EMBEDDED_REPORTS',
      predicate: TabPredicate.AUTHENTICATED_ONLINE,
      platform: PlatformPredicate.WEB,
      layout: LayoutMode.MAP_HIDDEN,
      icon: <Assessment />
    },
    {
      id: 'news',
      path: '/News',
      activePaths: [{ path: '/News' }],
      label: 'News',
      predicate: TabPredicate.AUTHENTICATED_ONLINE,
      platform: PlatformPredicate.WEB,
      layout: LayoutMode.MAP_HIDDEN,
      icon: <Newspaper />
    },
    {
      id: 'training',
      path: '/Training',
      activePaths: [{ path: '/Training' }],
      label: 'Training',
      requiresFeature: 'TRAINING_PAGE',
      predicate: TabPredicate.ALWAYS,
      platform: PlatformPredicate.WEB,
      layout: LayoutMode.MAP_HIDDEN,
      icon: <School />
    },
    {
      id: 'map',
      path: '/Map',
      activePaths: [{ path: '/Map' }],
      label: 'Map',
      requiresFeature: 'MAP',
      predicate: TabPredicate.UNAUTHENTICATED,
      platform: PlatformPredicate.BOTH,
      layout: LayoutMode.MAP_EXCLUSIVE,
      icon: <Map />
    }
  ];

  return { PRIMARY_NAVIGATION_LINKS, filteredLinks };
}

export { usePrimaryNavigationLinks, LayoutMode, TabPredicate, PlatformPredicate };
export type { PrimaryNavigationLink };
