import { getDBConnection } from '../database/db';
import { getMetabaseGroupsSQL } from '../queries/role-queries';
import { closeMetabaseSession, getMetabaseSession, METABASE_TIMEOUT, METABASE_URL } from '../utils/metabase-session';
import axios from 'axios';
import { getLogger } from '../utils/logger';

const defaultLog = getLogger('admin/metabase_groups');

// used internally
interface IMetabaseToInvasivesGroupMapping {
  metabaseGroup: string;
  invasivesGroup: string;
  metabaseGroupId: number;
}

interface IMatchedUser {
  email: string;
  metabaseUserId: number;
  actualGroups: number[];
  desiredGroups: number[];
  groupsToAdd: number[];
  groupsToRemove: number[];
}

interface IUnmatchedUser {
  email: string;
}

interface IActionTaken {
  action: 'ADDED' | 'DELETED';
  email: string;
  metabaseGroupName: string;
}

// we figure out the ids later
const GROUP_MAPPING: IMetabaseToInvasivesGroupMapping[] = [
  { metabaseGroup: 'Invasives Standard Users', invasivesGroup: 'standard_user', metabaseGroupId: null },
  { metabaseGroup: 'Invasives Administrators', invasivesGroup: 'master_admin', metabaseGroupId: null }
];

// report out which local users map to which metabase groups
async function getMetabaseGroupMappings(req, res) {
  const connection = await getDBConnection();
  if (!connection) {
    return res.status(503).json({ message: 'Database connection unavailable', request: req.body, code: 503 });
  }
  try {
    const sqlStatement = getMetabaseGroupsSQL();
    const result = await connection.query(sqlStatement.text, sqlStatement.values);
    return res.status(200).json(result.rows);
  } catch (error) {
    return res.status(500).send();
  } finally {
    connection.release();
  }
}

// call via a cronjob periodically. calls out to metabase to make sure our local group memberships are copied into metabase.
async function postSyncMetabaseGroupMappings(req, res) {
  const connection = await getDBConnection();
  if (!connection) {
    return res.status(503).json({ message: 'Database connection unavailable', request: req.body, code: 503 });
  }

  try {
    const sqlStatement = getMetabaseGroupsSQL();
    const queryResult = await connection.query(sqlStatement.text, sqlStatement.values);

    const session = await getMetabaseSession();

    // figure out the identifiers for metabase groups
    const groupsResponse = await axios({
      method: 'get',
      url: METABASE_URL + `/api/permissions/group`,
      headers: {
        'X-Metabase-Session': session
      },
      timeout: METABASE_TIMEOUT
    });
    for (const group of GROUP_MAPPING) {
      const matchedGroup = groupsResponse.data.find((metabaseGroup) => metabaseGroup.name === group.metabaseGroup);
      if (!matchedGroup) {
        throw new Error(`'Could not locate matching metabase group with name ${group.metabaseGroup}`);
      }
      group.metabaseGroupId = matchedGroup.id;
    }

    defaultLog.debug(`resolved metabase groups as:  ${GROUP_MAPPING}`);

    // get all active metabase users for comparison to our own user data
    const users = await axios({
      method: 'get',
      url: METABASE_URL + `/api/user`,
      headers: {
        'X-Metabase-Session': session
      },
      timeout: METABASE_TIMEOUT
    });

    // build the list of users we found in Metabase (and those we didn't)
    const usersFoundInMetabase: IMatchedUser[] = [];
    const usersNotFoundInMetabase: IUnmatchedUser[] = [];

    let totalActionsRequired = 0;

    // the groups whose membership we care about
    const managedGroups: number[] = GROUP_MAPPING.map((g) => g.metabaseGroupId);

    for (const localUser of queryResult.rows) {
      const matchedUser = users.data.find((metabaseUser) => metabaseUser.email === localUser.email);
      if (!matchedUser) {
        usersNotFoundInMetabase.push({ email: localUser.email });
      } else {
        const actualGroups: number[] = matchedUser.group_ids.filter((id) => managedGroups.includes(id));
        const desiredGroups: number[] = localUser.metabase_groups.map(
          (name) => GROUP_MAPPING.find((g) => g.invasivesGroup === name).metabaseGroupId
        );
        const groupsToAdd = desiredGroups.filter((g) => !actualGroups.includes(g));
        const groupsToRemove = actualGroups.filter((g) => !desiredGroups.includes(g));

        totalActionsRequired += groupsToAdd.length + groupsToRemove.length;

        usersFoundInMetabase.push({
          metabaseUserId: matchedUser.id,
          email: localUser.email,
          actualGroups,
          desiredGroups,
          groupsToAdd,
          groupsToRemove
        });
      }
    }

    defaultLog.debug(`Total actions required to align metabase permissions with ours: ${totalActionsRequired}`);

    // we now know what needs to be done. make it so.
    const actionsTaken: IActionTaken[] = [];

    // first the additions
    for (const matchedUser of usersFoundInMetabase) {
      for (const groupToAdd of matchedUser.groupsToAdd) {
        defaultLog.debug(
          `Calling out to metabase to add ${matchedUser.email} to group ${
            GROUP_MAPPING.find((g) => g.metabaseGroupId === groupToAdd).metabaseGroup
          }`
        );

        await axios({
          method: 'post',
          url: METABASE_URL + `/api/permissions/membership`,
          headers: {
            'X-Metabase-Session': session
          },
          data: {
            user_id: matchedUser.metabaseUserId,
            group_id: groupToAdd
          },
          timeout: METABASE_TIMEOUT
        });

        defaultLog.debug('Metabase request completed successfully');

        actionsTaken.push({
          action: 'ADDED',
          metabaseGroupName: GROUP_MAPPING.find((g) => g.metabaseGroupId === groupToAdd).metabaseGroup,
          email: matchedUser.email
        });
      }
    }

    // ...and now the deletions
    for (const matchedUser of usersFoundInMetabase) {
      for (const groupToRemove of matchedUser.groupsToRemove) {
        // for deletion, we first have to resolve the membership_id
        const groupMembership = await axios({
          method: 'get',
          url: METABASE_URL + `/api/permissions/group/` + groupToRemove,
          headers: {
            'X-Metabase-Session': session
          },
          timeout: METABASE_TIMEOUT
        });

        const membershipId = groupMembership.data.members.find(
          (membership) => membership.user_id === matchedUser.metabaseUserId
        )?.membership_id;

        if (!membershipId) {
          // odd. it was there when we checked earlier.
          defaultLog.warn(
            `Could not resolve ${matchedUser.email}'s membership in group ${
              GROUP_MAPPING.find((g) => g.metabaseGroupId === groupToRemove).metabaseGroup
            }, will not delete`
          );
        } else {
          defaultLog.debug(
            `Resolved ${matchedUser.email}'s membership in group ${
              GROUP_MAPPING.find((g) => g.metabaseGroupId === groupToRemove).metabaseGroup
            } to membership_id ${membershipId}, calling out to metabase to delete it`
          );

          await axios({
            method: 'delete',
            url: METABASE_URL + `/api/permissions/membership/` + membershipId,
            headers: {
              'X-Metabase-Session': session
            },
            timeout: METABASE_TIMEOUT
          });

          defaultLog.debug('Metabase request completed successfully');

          actionsTaken.push({
            action: 'DELETED',
            metabaseGroupName: GROUP_MAPPING.find((g) => g.metabaseGroupId === groupToRemove).metabaseGroup,
            email: matchedUser.email
          });
        }
      }
    }

    defaultLog.info(
      `Synchronization run completed successfully. ${actionsTaken.length} of ${totalActionsRequired} updates executed`
    );

    // return some useful info for logging in the calling cron job
    return res.status(200).json({
      resolvedGroupMappings: GROUP_MAPPING,
      found: usersFoundInMetabase,
      notFound: usersNotFoundInMetabase,
      actionsTaken
    });
  } catch (error) {
    defaultLog.error({ message: 'Error in metabase permission synchronization run', error });
    return res.status(500).json({ error });
  } finally {
    await closeMetabaseSession();
    connection.release();
  }
}

export { getMetabaseGroupMappings, postSyncMetabaseGroupMappings };
