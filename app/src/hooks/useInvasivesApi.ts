import { select } from 'redux-saga/effects';
import {
  IActivitySearchCriteria,
  ICreateOrUpdateActivity,
  IPointOfInterestSearchCriteria
} from 'interfaces/useInvasivesApi-interfaces';
import { selectConfiguration } from 'state/reducers/configuration';
import { useSelector } from 'utils/use_selector';
import { getCurrentJWT } from 'state/sagas/auth/auth';

export const useInvasivesApi = () => {
  const { API_BASE } = useSelector(selectConfiguration);
  const getActivities = async (activitiesSearchCriteria: IActivitySearchCriteria): Promise<any> => {
    const url = new URL(API_BASE + `/api/activities/`);
    url.searchParams.set('query', JSON.stringify(activitiesSearchCriteria));
    const res = await fetch(url, {
      headers: {
        Authorization: await getCurrentJWT()
      }
    });
    const data = await res.json();
    return { rows: data.result, count: data.count };
  };

  const getActivitiesLean = async (activitiesSearchCriteria: IActivitySearchCriteria): Promise<any> => {
    const res = await fetch(API_BASE + `/api/activities-lean/`, {
      method: 'POST',
      headers: {
        Authorization: await getCurrentJWT(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(activitiesSearchCriteria)
    });
    const data = await res.json();
    return data.result;
  };

  const deleteActivities = async (activityIds: string[]): Promise<any> => {
    const url = new URL(API_BASE + `/api/activities`);
    url.searchParams.set('id', JSON.stringify(activityIds));
    const res = await fetch(url, {
      method: 'DELETE',
      headers: { Authorization: await getCurrentJWT() }
    });
    const data = await res.json();
    return data.result;
  };
  const undeleteActivities = async (activityIds: string[]): Promise<any> => {
    const url = new URL(API_BASE + `/api/deleted/activities`);
    url.searchParams.set('id', JSON.stringify(activityIds));
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: await getCurrentJWT(),
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    return data.result;
  };

  const getRoles = async (): Promise<any> => {
    const res = await fetch(API_BASE + `/api/roles/`, {
      headers: { Authorization: await getCurrentJWT() }
    });
    const data = await res.json();
    return data.result;
  };
  const getPointsOfInterest = async (pointsOfInterestSearchCriteria: IPointOfInterestSearchCriteria): Promise<any> => {
    const url = new URL(API_BASE + `/api/points-of-interest/`);
    url.searchParams.set('query', JSON.stringify(pointsOfInterestSearchCriteria));
    const res = await fetch(url, {
      headers: { Authorization: await getCurrentJWT() }
    });
    const data = await res.json();
    return data.result;
  };
  const getAccessRequestData = async (accessRequest: any): Promise<any> => {
    const res = await fetch(API_BASE + `/api/access-request-read`, {
      method: 'POST',
      headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' },
      body: JSON.stringify(accessRequest)
    });
    const data = await res.json();
    return data.result;
  };
  const getAccessRequests = async (): Promise<any> => {
    const res = await fetch(API_BASE + `/api/access-request/`, {
      headers: { Authorization: await getCurrentJWT() }
    });
    const data = await res.json();
    return data.result;
  };
  const approveAccessRequests = async (accessRequests: any[]) => {
    const res = await fetch(API_BASE + `/api/access-request`, {
      method: 'POST',
      headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvedAccessRequests: accessRequests })
    });
    const data = await res.json();
    // not result here. this is different than all the others. intentional?
    return data;
  };
  const declineAccessRequest = async (accessRequest: any): Promise<any> => {
    const res = await fetch(API_BASE + `/api/access-request`, {
      method: 'POST',
      headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ declinedAccessRequest: accessRequest })
    });
    const data = await res.json();
    return data.result;
  };
  const revokeRoleFromUser = async (userId: number, roleId: number): Promise<any> => {
    const res = await fetch(API_BASE + `/api/user-access`, {
      method: 'DELETE',
      headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: userId, roleId: roleId })
    });
    const data = await res.json();
    return data.result;
  };
  const getRolesForUser = async (userId: string): Promise<any> => {
    const res = await fetch(API_BASE + `/api/user-access?userId=${userId}`, {
      headers: { Authorization: await getCurrentJWT() }
    });
    const data = await res.json();
    return data.result;
  };
  const getUsersForRole = async (roleId: string): Promise<any> => {
    const res = await fetch(API_BASE + `/api/user-access?roleId=${roleId}`, {
      headers: { Authorization: await getCurrentJWT() }
    });
    const data = await res.json();
    return data.result;
  };
  const batchGrantRoleToUser = async (userIds: number[], roleId: number): Promise<any> => {
    const res = await fetch(API_BASE + `/api/user-access`, {
      method: 'POST',

      headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ userIds: userIds, roleId: roleId })
    });
    const data = await res.json();
    return data.result;
  };
  const submitAccessRequest = async (accessRequest: any): Promise<any> => {
    const res = await fetch(API_BASE + `/api/access-request`, {
      method: 'POST',
      headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ newAccessRequest: accessRequest })
    });
    const data = await res.json();
    return data.result;
  };
  const submitUpdateRequest = async (updateRequest: any): Promise<any> => {
    const res = await fetch(API_BASE + `/api/update-request`, {
      method: 'POST',
      headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' },

      body: JSON.stringify({ newUpdateRequest: updateRequest })
    });
    const data = await res.json();
    return data.result;
  };
  const getUpdateRequests = async (): Promise<any> => {
    const res = await fetch(API_BASE + `/api/update-request/`, {
      headers: { Authorization: await getCurrentJWT() }
    });
    const data = await res.json();
    return data.result;
  };
  const declineUpdateRequest = async (updateRequest) => {
    const res = await fetch(API_BASE + `/api/update-request`, {
      method: 'POST',
      headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ declinedUpdateRequest: updateRequest })
    });
    const data = await res.json();
    return data.result;
  };
  const approveUpdateRequests = async (updateRequest) => {
    const res = await fetch(API_BASE + `/api/update-request`, {
      method: 'POST',
      headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ approvedUpdateRequests: updateRequest })
    });
    const data = await res.json();
    return data.result;
  };
  const getFundingAgencies = async (): Promise<any> => {
    const res = await fetch(API_BASE + `/api/agency_codes`, {
      headers: { Authorization: await getCurrentJWT() }
    });
    const data = await res.json();
    data.result.sort((a, b) => a.code_description.localeCompare(b.code_description));
    return data.result;
  };
  const getEmployers = async (): Promise<any> => {
    const res = await fetch(API_BASE + `/api/employer_codes`, {
      headers: { Authorization: await getCurrentJWT() }
    });
    const data = await res.json();
    data.result.sort((a, b) => a.code_description.localeCompare(b.code_description));
    return data.result;
  };

  const getPointsOfInterestLean = async (
    pointsOfInterestSearchCriteria: IPointOfInterestSearchCriteria
  ): Promise<any> => {
    const url = new URL(API_BASE + `/api/points-of-interest-lean/`);
    url.searchParams.set('query', JSON.stringify(pointsOfInterestSearchCriteria));

    const res = await fetch(url, {
      headers: { Authorization: await getCurrentJWT() }
    });
    const data = await res.json();

    return data.result;
  };

  const getMedia = async (media_keys: string[]): Promise<any> => {
    const url = new URL(API_BASE + `/api/media`);
    for (const key of media_keys) {
      url.searchParams.append('key', key);
    }
    const res = await fetch(url, {
      headers: { Authorization: await getCurrentJWT() }
    });
    const data = await res.json();

    return data.result;
  };
  const getApplicationUsers = async (): Promise<any> => {
    const res = await fetch(API_BASE + `/application-user`, {
      headers: { Authorization: await getCurrentJWT() }
    });
    const data = await res.json();

    return data.result;
  };
  const renewUser = async (id): Promise<any> => {
    const res = await fetch(API_BASE + `/api/application-user/renew?userId=${id}`, {
      headers: { Authorization: await getCurrentJWT() },
      method: 'POST'
    });
    const data = await res.json();

    return data.result;
  };
  const createActivity = async (activity: ICreateOrUpdateActivity): Promise<any> => {
    const res = await fetch(API_BASE + '/api/activity', {
      method: 'POST',
      headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' },
      body: JSON.stringify(activity)
    });
    const data = await res.json();

    return data.result;
  };
  const updateActivity = async (activity: ICreateOrUpdateActivity): Promise<any> => {
    // Not sure who is using this... But its smelling
    // const oldActivity = await getActivityById(activity.activity_id);
    const res = await fetch(API_BASE + '/api/activity', {
      method: 'PUT',
      headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' },
      body: JSON.stringify(activity)
    });
    const data = await res.json();

    return data.result;
  };
  const getSimplifiedGeoJSON = async (url_geo: string, percentage: string): Promise<any> => {
    const res = await fetch(API_BASE + `/api/map-shaper?url=${url_geo}&percentage=${percentage}`, {
      headers: { Authorization: await getCurrentJWT() }
    });
    const data = await res.json();

    return data.result;
  };

  const listCodeTables = async (): Promise<any> => {
    const res = await fetch(API_BASE + '/api/code_tables', {
      headers: { Authorization: await getCurrentJWT() }
    });
    const data = await res.json();

    return data.result;
  };
  const fetchCodeTable = async (codeHeaderName, csv = false): Promise<any> => {
    const res = await fetch(`${API_BASE}/api/code_tables/${codeHeaderName}`, {
      headers: { Authorization: await getCurrentJWT(), Accept: csv ? 'text/csv' : 'application/json' }
    });
    const data = await res.json();

    return data.result;
  };
  const postAdminUploadShape = async (uploadRequest): Promise<any> => {
    const res = await fetch(`${API_BASE}/api/admin-defined-shapes/`, {
      method: 'POST',
      headers: { Authorization: await getCurrentJWT(), 'Content-Type': 'application/json' },
      body: JSON.stringify(uploadRequest)
    });
    const data = await res.json();

    return data;
  };
  const getEmbeddedMetabaseReport = async (reportId: string): Promise<any> => {
    const res = await fetch(`${API_BASE}/api/embedded-report/${reportId}`, {
      headers: { Authorization: await getCurrentJWT() }
    });
    const data = await res.json();

    return data;
  };
  const listEmbeddedMetabaseReports = async (): Promise<any> => {
    const res = await fetch(`${API_BASE}/api/embedded-report`, {
      headers: { Authorization: await getCurrentJWT() }
    });
    const data = await res.json();

    return data;
  };
  return {
    getMedia,
    getActivities,
    getActivitiesLean,
    deleteActivities,
    undeleteActivities,
    createActivity,
    updateActivity,
    getPointsOfInterest,
    getPointsOfInterestLean,
    getSimplifiedGeoJSON,
    getAccessRequestData,
    listCodeTables,
    fetchCodeTable,
    getApplicationUsers,
    submitAccessRequest,
    getEmployers,
    getFundingAgencies,
    getRolesForUser,
    getUsersForRole,
    batchGrantRoleToUser,
    revokeRoleFromUser,
    getRoles,
    getAccessRequests,
    approveAccessRequests,
    declineAccessRequest,
    renewUser,
    postAdminUploadShape,
    submitUpdateRequest,
    getUpdateRequests,
    declineUpdateRequest,
    approveUpdateRequests,
    listEmbeddedMetabaseReports,
    getEmbeddedMetabaseReport
  };
};

export function* InvasivesAPI_Call(method, endpoint, payloadData?, additionalHeaders?, dataAs?: 'text' | 'json') {
  // get config and request setup from store
  const { API_BASE } = yield select(selectConfiguration);

  const url = new URL(API_BASE + endpoint);

  async function response_data(res: Response) {
    switch (dataAs) {
      case 'text':
        return await res.text();
      case 'json':
      default:
        return await res.json();
    }
  }

  if (method === 'GET') {
    if (payloadData) {
      url.searchParams.set('query', JSON.stringify(payloadData));
    }

    const res = yield fetch(url, {
      method: method,
      headers: { Authorization: yield getCurrentJWT(), ...additionalHeaders }
    });
    const data = yield response_data(res);
    const status = res.status;
    return { data, status, url };
  } else if (['PUT', 'POST'].includes(method)) {
    const res = yield fetch(url, {
      method: method,
      headers: { Authorization: yield getCurrentJWT(), 'Content-Type': 'application/json' },
      body: JSON.stringify(payloadData)
    });
    const data = yield response_data(res);
    const status = res.status;
    return { data, status, url };
  } else if (method === 'DELETE') {
    const payloadOptions: { body?: string } = {};
    if (payloadData) {
      payloadOptions.body = JSON.stringify(payloadData);
    }
    const res = yield fetch(url, {
      method: method,
      headers: { Authorization: yield getCurrentJWT(), 'Content-Type': 'application/json' },
      ...payloadOptions
    });
    const data = yield response_data(res);
    const status = res.status;
    return { data, status, url };
  } else {
    const res = yield fetch(url, {
      method: method,
      headers: { Authorization: yield getCurrentJWT() }
    });
    const data = yield response_data(res);
    const status = res.status;
    return { data, status, url };
  }
}

export function* getSimplifiedGeoJSON(url_geo: string, percentage: string) {
  const response = yield InvasivesAPI_Call('GET', `/api/map-shaper?url=${url_geo}&percentage=${percentage}`);
  return response.data.result;
}
