import { Capacitor } from '@capacitor/core';
import { fetchLayerDataFromLocal } from 'components/map/LayerLoaderHelpers/AdditionalHelperFunctions';
import { useContext } from 'react';
import { DocType } from '../constants/database';
import { DatabaseContext, DBRequest, query, QueryType, upsert, UpsertType } from '../contexts/DatabaseContext';
import {
  IActivitySearchCriteria,
  ICreateOrUpdateActivity,
  IJurisdictionSearchCriteria,
  IPointOfInterestSearchCriteria,
  IRisoSearchCriteria
} from '../interfaces/useInvasivesApi-interfaces';
import { useInvasivesApi } from './useInvasivesApi';
import { useSelector } from '../state/utilities/use_selector';
import { selectConfiguration } from '../state/reducers/configuration';
import { selectNetworkConnected } from '../state/reducers/network';
import { ActivitySyncStatus } from 'sharedAPI';

/**
 * Returns a set of supported api methods.
 *
 * @return {object} object whose properties are supported api methods.
 *
 */
export const useDataAccess = () => {
  const api = useInvasivesApi();
  const databaseContext = useContext(DatabaseContext);
  //const { MOBILE } = useSelector(selectConfiguration);
  const MOBILE = false;
  const connected = useSelector(selectNetworkConnected);

  /**
   * Fetch points of interest by search criteria.
   *
   * @param {pointsOfInterestSearchCriteria} pointsOfInterestSearchCriteria
   * @return {*}  {Promise<any>}
   */
  const getPointsOfInterest = async (
    pointsOfInterestSearchCriteria: IPointOfInterestSearchCriteria,
    forceCache = false
  ): Promise<any> => {
    if (!MOBILE) {
      const response = await api.getPointsOfInterest(pointsOfInterestSearchCriteria);
      return response;
    } else {
      if (forceCache === true || !connected) {
        return databaseContext.asyncQueue({
          asyncTask: () => {
            return query(
              {
                type: QueryType.DOC_TYPE,
                docType: DocType.REFERENCE_POINT_OF_INTEREST,
                limit: pointsOfInterestSearchCriteria.limit,
                offset: pointsOfInterestSearchCriteria.page
              },
              databaseContext
            );
          }
        });
      } else {
        const response = await api.getPointsOfInterest(pointsOfInterestSearchCriteria);
        return response;
      }
    }
  };

  /**
   * Fetch points of interest (lean) by search criteria.
   *
   * @param {pointsOfInterestSearchCriteria} pointsOfInterestSearchCriteria
   * @return {*}  {Promise<any>}
   */
  const getPointsOfInterestLean = async (
    pointsOfInterestSearchCriteria: IPointOfInterestSearchCriteria
  ): Promise<any> => {
    if (!MOBILE) {
      const response = await api.getPointsOfInterestLean(pointsOfInterestSearchCriteria);
      return response;
    } else {
      if (!connected) {
        const featuresArray = await fetchLayerDataFromLocal(
          'LEAN_POI',
          pointsOfInterestSearchCriteria.search_feature,
          databaseContext
        );
        return {
          rows: featuresArray,
          count: featuresArray.length
        };
      } else {
        const response = await api.getPointsOfInterest(pointsOfInterestSearchCriteria);
        return response;
      }
    }
  };

  /**
   * Fetch jurisdictions by search criteria.
   *
   * @param {jurisdictionSearchCriteria} jurisdictionSearchCriteria
   * @return {*}  {Promise<any>}
   */
  const getJurisdictions = async (jurisdictionSearchCriteria: IJurisdictionSearchCriteria): Promise<any> => {
    if (!MOBILE) {
      const response = await api.getJurisdictions(jurisdictionSearchCriteria);
      return response;
    } else {
      if (!connected) {
        const featuresArray = await fetchLayerDataFromLocal(
          'JURISDICTIONS',
          jurisdictionSearchCriteria.search_feature,
          databaseContext
        );

        return {
          rows: featuresArray,
          count: featuresArray.length
        };
      } else {
        const response = await api.getJurisdictions(jurisdictionSearchCriteria);
        return response;
      }
    }
  };

  /**
   * Fetch RISOs by search criteria.
   *
   * @param {risoSearchCriteria} risoSearchCriteria
   * @returns {*} {Promise<any>}
   */
  const getRISOs = async (risoSearchCriteria: IRisoSearchCriteria): Promise<any> => {
    if (!MOBILE) {
      const response = await api.getRISOs(risoSearchCriteria);
      return response;
    } else {
      if (!connected) {
        const featuresArray = await fetchLayerDataFromLocal('RISOS', risoSearchCriteria.search_feature, context);

        return {
          rows: featuresArray,
          count: featuresArray.length
        };
      } else {
        const response = await api.getRISOs(risoSearchCriteria);
        return response;
      }
    }
  };

  /**
   * Fetch a signle activity by its id.
   *
   * @param {string} activityId
   * @return {*}  {Promise<any>}
   */
  const getActivityById = async (activityId: string, forceCache?: boolean, referenceData = false): Promise<any> => {
    try {
      if (!MOBILE) {
        const response = await api.getActivityById(activityId);
        return response;
      } else {
        if (forceCache === true || !connected) {
          // Removed for now due to not being able to open cached activity
          const res = await databaseContext.asyncQueue({
            asyncTask: async () => {
              const res = await query(
                {
                  type: QueryType.DOC_TYPE_AND_ID,
                  docType: referenceData ? DocType.REFERENCE_ACTIVITY : DocType.ACTIVITY,
                  ID: activityId
                },
                databaseContext
              );
              return JSON.parse(res[0]?.json);
              // Removed for now due to not being able to open cached activity
            }
          });
          return res;
        } else {
          const response = await api.getActivityById(activityId);
          return response;
        }
      }
    } catch (e) {
      throw new Error(
        `unable to get activity by id:  debug info:  ${JSON.stringify(
          activityId
        )}, ${referenceData})}, ${JSON.stringify(e)}`
      );
    }
  };

  /**
   * Update an existing activity record.
   *
   * @param {ICreateOrUpdateActivity} activity
   * @return {*}  {Promise<any>}
   */
  const updateActivity = async (activity: ICreateOrUpdateActivity): Promise<any> => {
    if (!MOBILE) {
      //TODO: implement getting old version from server and making new with overwritten props
      // IN USEINVASIVES API
      return await api.updateActivity(activity);
    } else {
      return databaseContext.asyncQueue({
        asyncTask: () => {
          try {
            return upsert(
              [
                {
                  type: UpsertType.MOBILE_ACTIVITY_PATCH,
                  docType: DocType.ACTIVITY,
                  json: activity,
                  ID: activity.activity_id,
                  sync_status: activity.sync_status,
                  activity_subtype: activity.activity_subtype
                }
              ],
              databaseContext
            );
          } catch (err) {
            console.log('Error occurred: ', err);
          }
        }
      });
    }
  };

  /**
   * Get all the trip records
   *
   * @return {*}  {Promise<any>}
   */
  const getTrips = async () => {
    return databaseContext.asyncQueue({
      asyncTask: () => {
        return query({ type: QueryType.DOC_TYPE, docType: DocType.TRIP }, databaseContext);
      }
    });
  };

  /**
   * Add new trip object record
   *
   * @param {any} newTripObj
   * @return {*}  {Promise<any>}
   */
  const addTrip = async (newTripObj: any) => {
    return databaseContext.asyncQueue({
      asyncTask: () => {
        return upsert([{ type: UpsertType.DOC_TYPE, docType: DocType.TRIP, json: newTripObj }], databaseContext);
      }
    });
  };

  /**
   * Get all the boundary (trip currently) records
   *
   * @return {*}  {Promise<any>}
   */
  const getBoundaries = async () => {
    if (MOBILE) {
      return databaseContext.asyncQueue({
        asyncTask: () => {
          return query({ type: QueryType.DOC_TYPE, docType: DocType.TRIP }, databaseContext);
        }
      });
    } else {
      const result = localStorage.getItem('boundaries');
      return new Promise((resolve, reject) => {
        resolve(JSON.parse(result));
        //no reject for now so it fails gracefully and returns a null to be handled in jumptotrip
      });
    }
  };

  /**
   * Add new boundary object (trip currently) record
   *
   * @param {any} newBoundaryObj
   * @return {*}  {Promise<any>}
   */
  const addBoundary = async (newBoundaryObj: any) => {
    if (MOBILE) {
      return databaseContext.asyncQueue({
        asyncTask: () => {
          return upsert([{ type: UpsertType.DOC_TYPE, docType: DocType.TRIP, json: newBoundaryObj }], databaseContext);
        }
      });
    } else {
      //cache in localStorage
      const boundaries = [];
      const currBoundaries = await getBoundaries();

      if (currBoundaries) boundaries.push(...currBoundaries);
      boundaries.push(newBoundaryObj);

      localStorage.setItem('boundaries', JSON.stringify(boundaries));
    }
  };

  /**
   * Delete boundary object (trip currently) record
   *
   * @param {number} id
   * @return {*}  {Promise<any>}
   */
  const deleteBoundary = async (id: number) => {
    if (MOBILE) {
      return databaseContext.asyncQueue({
        asyncTask: () => {
          return upsert(
            [
              {
                type: UpsertType.DOC_TYPE_AND_ID_DELETE,
                docType: DocType.TRIP,
                ID: String(id)
              }
            ],
            databaseContext
          );
        }
      });
    } else {
      const boundaries = await getBoundaries();
      const newBoundaries = boundaries.filter((b) => {
        return b.id !== id;
      });

      localStorage.setItem('boundaries', JSON.stringify(newBoundaries));
    }
  };

  const getApplicationUsers = async (): Promise<any> => {
    return databaseContext.asyncQueue({
      asyncTask: async () => {
        let res = await query(
          {
            type: QueryType.DOC_TYPE,
            docType: DocType.APPLICATION_USER,
            ID: '1'
          },
          databaseContext
        );
        res = res?.length > 0 ? JSON.parse(res[0].json) : null;
        return res;
      }
    });
  };

  const cacheApplicationUsers = async () => {
    if (connected && MOBILE) {
      const users = await api.getApplicationUsers();
      return databaseContext.asyncQueue({
        asyncTask: () => {
          return upsert(
            [{ type: UpsertType.DOC_TYPE_AND_ID, docType: DocType.APPLICATION_USER, ID: '1', json: users }],
            databaseContext
          );
        }
      });
    }
  };

  /**
   * Fetch activities by search criteria.  Also can be used to get cached reference activities on MOBILE.
   *
   * @param {activitiesSearchCriteria} activitiesSearchCriteria
   * @return {*}  {Promise<any>}
   */
  const getActivitiesForMOBILESync = async (activitiesSearchCriteria: IActivitySearchCriteria): Promise<any> => {
    if (Capacitor.getPlatform() !== 'web') {
      const dbContext = databaseContext;

      const typeClause = activitiesSearchCriteria.activity_type
        ? ` and json_extract(json(json), '$.activity_type') IN (${JSON.stringify(
            activitiesSearchCriteria.activity_type
          ).replace(/[\[\]']+/g, '')})`
        : '';
      const subTypeClause = activitiesSearchCriteria.activity_subtype
        ? ` and json_extract(json(json), '$.activity_subtype') IN (${JSON.stringify(
            activitiesSearchCriteria.activity_subtype
          ).replace(/[\[\]']+/g, '')})`
        : '';

      const sql = `select *
                   from activity
                   where 1 = 1
                     and sync_status = '${ActivitySyncStatus.NOT_SAVED}' ${typeClause} ${subTypeClause}`;
      const asyncReturnVal = await dbContext.asyncQueue({
        asyncTask: () => {
          return query(
            {
              type: QueryType.RAW_SQL,
              sql: sql
            },
            dbContext
          );
        }
      });
      return {
        rows: asyncReturnVal.map((val) => JSON.parse(val.json)),
        count: asyncReturnVal.length
      };
    }
  };

  const cacheEmployers = async () => {
    if (connected && MOBILE) {
      const employers = await api.getEmployers();
      console.log('employers', employers);
      return databaseContext.asyncQueue({
        asyncTask: () => {
          return upsert(
            [{ type: UpsertType.DOC_TYPE_AND_ID, docType: DocType.EMPLOYER, ID: '1', json: employers }],
            databaseContext
          );
        }
      });
    }
  };

  const cacheFundingAgencies = async () => {
    if (connected && MOBILE) {
      const agencies = await api.getFundingAgencies();
      return databaseContext.asyncQueue({
        asyncTask: () => {
          return upsert(
            [{ type: UpsertType.DOC_TYPE_AND_ID, docType: DocType.AGENCY, ID: '1', json: agencies }],
            databaseContext
          );
        }
      });
    }
  };

  const cacheRolesForUser = async (userId) => {
    if (connected && MOBILE) {
      const userRoles = await api.getRolesForUser(userId);
      return databaseContext.asyncQueue({
        asyncTask: () => {
          return upsert(
            [{ type: UpsertType.DOC_TYPE_AND_ID, docType: DocType.USER_ROLE, ID: '1', json: userRoles }],
            databaseContext
          );
        }
      });
    }
  };

  const cacheAllRoles = async () => {
    if (connected && MOBILE) {
      const roles = await api.getRoles();
      if (!roles) {
        return;
      }

      return databaseContext.asyncQueue({
        asyncTask: () => {
          return upsert(
            [{ type: UpsertType.DOC_TYPE_AND_ID, docType: DocType.ROLE, ID: '1', json: roles }],
            databaseContext
          );
        }
      });
    }
  };

  const cacheCurrentUserBCEID = async (bceid_userid) => {
    if (connected && MOBILE) {
      const user = await api.getUserByBCEID(bceid_userid);
      return databaseContext.asyncQueue({
        asyncTask: () => {
          return upsert(
            [{ type: UpsertType.DOC_TYPE_AND_ID, docType: DocType.USER, ID: '1', json: user }],
            databaseContext
          );
        }
      });
    }
  };

  const cacheCurrentUserIDIR = async (idir_userid) => {
    if (connected && MOBILE) {
      const user = await api.getUserByIDIR(idir_userid);

      return databaseContext.asyncQueue({
        asyncTask: () => {
          return upsert(
            [{ type: UpsertType.DOC_TYPE_AND_ID, docType: DocType.USER, ID: '1', json: user }],
            databaseContext
          );
        }
      });
    }
  };

  const getEmployers = async (): Promise<any> => {
    return databaseContext.asyncQueue({
      asyncTask: async () => {
        let res = await query(
          {
            type: QueryType.DOC_TYPE,
            docType: DocType.EMPLOYER,
            ID: '1'
          },
          databaseContext
        );
        res = res?.length > 0 ? JSON.parse(res[0].json) : null;
        return res;
      }
    });
  };

  const getFundingAgencies = async (): Promise<any> => {
    return databaseContext.asyncQueue({
      asyncTask: async () => {
        let res = await query(
          {
            type: QueryType.DOC_TYPE,
            docType: DocType.AGENCY,
            ID: '1'
          },
          databaseContext
        );
        res = res?.length > 0 ? JSON.parse(res[0].json) : null;
        return res;
      }
    });
  };

  const getRolesForUser = async (): Promise<any> => {
    return databaseContext.asyncQueue({
      asyncTask: async () => {
        let res = await query(
          {
            type: QueryType.DOC_TYPE,
            docType: DocType.USER_ROLE,
            ID: '1'
          },
          databaseContext
        );
        res = res?.length > 0 ? JSON.parse(res[0].json) : null;
        return res;
      }
    });
  };

  const getRoles = async (): Promise<any> => {
    return databaseContext.asyncQueue({
      asyncTask: async () => {
        let res = await query(
          {
            type: QueryType.DOC_TYPE,
            docType: DocType.ROLE,
            ID: '1'
          },
          databaseContext
        );
        res = res?.length > 0 ? JSON.parse(res[0].json) : null;
        return res;
      }
    });
  };

  const getCurrentUser = async (): Promise<any> => {
    return databaseContext.asyncQueue({
      asyncTask: async () => {
        let res = await query(
          {
            type: QueryType.DOC_TYPE,
            docType: DocType.USER,
            ID: '1'
          },
          databaseContext
        );
        res = res?.length > 0 ? JSON.parse(res[0].json) : null;
        return res;
      }
    });
  };

  /**
   * Fetch activities by search criteria.  Also can be used to get cached reference activities on MOBILE.
   *
   * @param {activitiesSearchCriteria} activitiesSearchCriteria
   * @return {*}  {Promise<any>}
   */
  const getActivities = async (
    activitiesSearchCriteria: IActivitySearchCriteria,
    forceCache = false,
    referenceCache = false
  ): Promise<any> => {
    if (!MOBILE) {
      return await api.getActivities(activitiesSearchCriteria);
    } else {
      if (forceCache === true || !connected) {
        const dbcontext = databaseContext;
        const table = referenceCache ? 'reference_activity' : 'activity';
        const typeClause = activitiesSearchCriteria.activity_type
          ? ` and json_extract(json(json), '$.activity_type') IN (${JSON.stringify(
              activitiesSearchCriteria.activity_type
            ).replace(/[\[\]']+/g, '')})`
          : '';
        const subTypeClause = activitiesSearchCriteria.activity_subtype
          ? ` and json_extract(json(json), '$.activity_subtype') IN (${JSON.stringify(
              activitiesSearchCriteria.activity_subtype
            ).replace(/[\[\]']+/g, '')})`
          : '';

        const sql = `select *
                     from ${table}
                     where 1 = 1 ${typeClause} ${subTypeClause}`;

        const asyncReturnVal = await dbcontext.asyncQueue({
          asyncTask: () => {
            return query(
              {
                type: QueryType.RAW_SQL,
                sql: sql
              },
              dbcontext
            );
          }
        });
        return {
          rows: asyncReturnVal.map((val) => {
            return {
              ...JSON.parse(val.json),
              cached: true
            };
          }),
          count: asyncReturnVal.length
        };
      } else {
        const response = await api.getActivities(activitiesSearchCriteria);
        return response;
      }
    }
  };

  /**
   * Fetch activities (lean) by search criteria.
   *
   * @param {activitiesSearchCriteria} activitiesSearchCriteria
   * @return {*}  {Promise<any>}
   */
  const getActivitiesLean = async (activitiesSearchCriteria: IActivitySearchCriteria): Promise<any> => {
    if (!MOBILE) {
      const response = await api.getActivitiesLean(activitiesSearchCriteria);
      return response;
    } else {
      if (!connected) {
        const featuresArray = await fetchLayerDataFromLocal(
          'LEAN_ACTIVITIES',
          activitiesSearchCriteria.search_feature,
          databaseContext
        );

        return {
          rows: featuresArray,
          count: featuresArray.length
        };
      } else {
        const response = await api.getActivitiesLean(activitiesSearchCriteria);
        return response;
      }
    }
  };

  /**
   * Create a new activity record.
   *
   * @param {ICreateOrUpdateActivity} activity
   * @return {*}  {Promise<any>}
   */
  const createActivity = async (
    activity: ICreateOrUpdateActivity,
    context?: { asyncQueue: (request: DBRequest) => Promise<any>; ready: boolean }
  ): Promise<any> => {
    if (!MOBILE) {
      return await api.createActivity(activity);
    } else {
      return databaseContext.asyncQueue({
        asyncTask: () => {
          return upsert(
            [
              {
                type: UpsertType.MOBILE_ACTIVITY_CREATE,
                docType: DocType.ACTIVITY,
                ID: activity.activity_id,
                json: activity,
                activity_subtype: activity.activity_subtype,
                sync_status: ActivitySyncStatus.NOT_SAVED
              }
            ],
            databaseContext
          );
        }
      });
    }
  };
  /**
   * Delete activities by ids.
   *
   * @param {string[]} activityIds
   * @return {*}  {Promise<any>}
   */
  const deleteActivities = async (activityIds: string[]): Promise<any> => {
    if (!MOBILE) {
      return await api.deleteActivities(activityIds);
    } else {
      return databaseContext.asyncQueue({
        asyncTask: () => {
          const idsForSQL = JSON.stringify(activityIds).replace(/[\[\]']+/g, '');
          const sql = `DELETE
                       FROM Activity
                       WHERE id IN ${'(' + idsForSQL + ')'}`;
          return upsert(
            [
              {
                type: UpsertType.RAW_SQL,
                sql: sql
              }
            ],
            databaseContext
          );
        }
      });
    }
  };

  const createUser = async (context?: {
    asyncQueue: (request: DBRequest) => Promise<any>;
    ready: boolean;
  }): Promise<any> => {
    return databaseContext.asyncQueue({
      asyncTask: async () => {
        let res = await query(
          {
            type: QueryType.DOC_TYPE,
            docType: DocType.USER_ROLE,
            ID: '1'
          },
          databaseContext
        );
        res = res?.length > 0 ? JSON.parse(res[0].json) : null;
        return res;
      }
    });
  };

  /**
   * Ge appState
   *
   * @param {any} selector
   * @return {*}  {Promise<any>}
   */
  const getAppState = async (): Promise<any> => {
    if (!MOBILE) {
      const raw_old = localStorage.getItem('appstate-invasivesbc');
      if (raw_old) {
        return JSON.parse(raw_old);
      }
    } else {
      const dbcontext = databaseContext;

      try {
        const result = await dbcontext.asyncQueue({
          asyncTask: () => {
            return query(
              {
                type: QueryType.DOC_TYPE_AND_ID,
                docType: DocType.APPSTATE,
                ID: '1'
              },
              dbcontext
            );
          }
        });
        return JSON.parse(result[0].json);
      } catch (err) {
        console.log('Thrown error in get app state', err);
        console.dir(err);
      }
    }
  };

  /**
   * Sync cached records
   * Used for syncing a user's cached MOBILE records
   * with the InvasivesBC DB
   *
   * @return {*} {Promise<any>}
   */
  const syncCachedRecords = async (): Promise<any> => {
    // Only callable on MOBILE
    if (MOBILE && connected) {
      await getActivitiesForMOBILESync({ activity_type: ['Observation', 'Treatment', 'Monitoring'] }).then(
        (res: any) => {
          if (res.count > 0) {
            res.rows.forEach(async (row: ICreateOrUpdateActivity) => {
              try {
                await api.createActivity(row);
              } catch (err) {
                console.log('Error saving activity to api');
              }
              let tempRow: ICreateOrUpdateActivity = row;
              tempRow.sync_status = ActivitySyncStatus.SAVE_SUCCESSFUL;
              console.log(tempRow);
              updateActivity(tempRow);
            });
          }
        }
      );
    }
  };

  /**
   * Get appState
   *
   * @param {any} activeActivity
   * @return {*}  {Promise<any>}
   */
  const setAppState = async (newState: any): Promise<any> => {
    if (!MOBILE) {
      const old = getAppState();
      if (old) {
        localStorage.setItem('appstate-invasivesbc', JSON.stringify({ ...old, ...newState }));
      } else {
        localStorage.setItem('appstate-invasivesbc', JSON.stringify({ ...newState }));
      }
    } else {
      const dbcontext = databaseContext;

      return dbcontext.asyncQueue({
        asyncTask: () => {
          return upsert(
            [
              {
                type: UpsertType.DOC_TYPE_AND_ID_FAST_JSON_PATCH,
                docType: DocType.APPSTATE,
                ID: '1',
                json: { ...newState }
              }
            ],
            dbcontext
          );
        }
      });
    }
  };

  const listCodeTables = async (): Promise<any> => {
    if (!MOBILE || connected) {
      return await api.listCodeTables();
    } else {
      return databaseContext.asyncQueue({
        asyncTask: () => {
          return query(
            {
              type: QueryType.DOC_TYPE,
              docType: DocType.CODE_TABLE
            },
            databaseContext
          );
        }
      });
    }
  };

  const cacheCodeTables = async (): Promise<any> => {
    if (connected && MOBILE) {
      const codeTables = await api.listCodeTables();
      console.log('Attempting to cache code tables...');
      if (codeTables && codeTables.length > 0) {
        console.log('#### data: ', codeTables);
        const upserts = codeTables.map((codeTableJSON, index) => ({
          type: UpsertType.DOC_TYPE_AND_ID,
          docType: DocType.CODE_TABLE,
          ID: codeTableJSON.name,
          json: codeTableJSON
        }));
        console.log('UPSERTS: ', upserts);
        try {
          await databaseContext.asyncQueue({
            asyncTask: () => {
              return upsert(upserts, databaseContext);
            }
          });
        } catch (e) {
          alert('unable to cache api spec');
          console.log('ERROR CACHING CODE TABLES: ', e);
        }
        return false;
      }
    }
  };

  const fetchCodeTable = async (codeHeaderName, csv = false) => {
    if (MOBILE) {
      return await api.fetchCodeTable(codeHeaderName, csv);
    } else {
      const data = await databaseContext.asyncQueue({
        asyncTask: () => {
          return query(
            {
              type: QueryType.DOC_TYPE,
              docType: DocType.CODE_TABLE,
              ID: codeHeaderName
            },
            databaseContext
          );
        }
      });
      console.log('DAAATAAA', data);
      return data;
    }
  };

  const deleteActivityFromCache = async (activityId: string) => {
    if (MOBILE) {
      return databaseContext.asyncQueue({
        asyncTask: () => {
          return upsert(
            [
              {
                type: UpsertType.DOC_TYPE_AND_ID_DELETE,
                docType: DocType.REFERENCE_ACTIVITY,
                ID: activityId
              }
            ],
            databaseContext
          );
        }
      });
    }
  };

  const getCachedActivityByID = async (activityId: string) => {
    if (MOBILE) {
      return databaseContext.asyncQueue({
        asyncTask: () => {
          return query(
            {
              type: QueryType.DOC_TYPE_AND_ID,
              docType: DocType.REFERENCE_ACTIVITY,
              ID: activityId
            },
            databaseContext
          );
        }
      });
    }
  };

  const getCachedActivityIDs = async () => {
    if (MOBILE) {
      const response = await databaseContext.asyncQueue({
        asyncTask: () => {
          return query(
            {
              type: QueryType.DOC_TYPE,
              docType: DocType.REFERENCE_ACTIVITY
            },
            databaseContext
          );
        }
      });
      return response;
    }
  };

  /**
   * Fetch iapp jurisdictions.
   *
   * @return {*}  {Promise<any>}
   */
  const getIappJurisdictions = async (forceCache = false): Promise<any> => {
    const response = await api.getIappJurisdictions();
    return response;
  };

  return {
    ...api,
    getPointsOfInterest,
    getPointsOfInterestLean,
    getActivityById,
    updateActivity,
    getTrips,
    addTrip,
    getBoundaries,
    addBoundary,
    deleteBoundary,
    getActivities,
    getActivitiesLean,
    createActivity,
    deleteActivities,
    getAppState,
    setAppState,
    getJurisdictions,
    getRISOs,
    syncCachedRecords,
    getApplicationUsers,
    cacheApplicationUsers,
    getRoles,
    getRolesForUser,
    getEmployers,
    getFundingAgencies,
    cacheEmployers,
    cacheFundingAgencies,
    cacheAllRoles,
    cacheRolesForUser,
    cacheCurrentUserBCEID,
    cacheCurrentUserIDIR,
    getCurrentUser,
    createUser,
    listCodeTables,
    fetchCodeTable,
    cacheCodeTables,
    getIappJurisdictions,
    deleteActivityFromCache,
    getCachedActivityByID,
    getCachedActivityIDs
  };
};
