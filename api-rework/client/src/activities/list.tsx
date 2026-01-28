import React, { useContext, useEffect, useState } from 'react';
import { API_URL } from 'constants';
import './activities.scss';
import Spinner from 'activities/spinner';
import { NavLink } from 'react-router';
import { AuthContext } from 'client';

interface ActivitySummary {
  id: string;
  type: string;
  subtype: string;
  date: string;
}

const SortingTableHeader = ({
  propertyName,
  title,
  sortDirection,
  sortProperty,
  setSortDirection,
  setSortProperty
}) => {
  return (
    <th
      className={sortProperty === propertyName ? 'active' : ''}
      onClick={() => {
        if (sortProperty === propertyName) {
          setSortDirection(sortDirection == 'asc' ? 'desc' : 'asc');
        } else {
          setSortProperty(propertyName);
        }
      }}>
      {title}
      {sortProperty === propertyName && <span className={'sort-direction'}>{sortDirection == 'desc' ? '⌄' : '^'}</span>}
    </th>
  );
};

const ActivitiesList: React.FC = () => {
  const [activities, setActivities] = useState<ActivitySummary[]>([]);
  const [sorted, setSorted] = useState<ActivitySummary[]>([]);

  const [sortProperty, setSortProperty] = useState<keyof ActivitySummary>('id');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { state: auth } = useContext(AuthContext);

  useEffect(() => {
    setLoading(true);
    setErrorMessage('');
    setError(false);

    fetch(`${API_URL}/activities`, {
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    })
      .then(async (res) => {
        setLoading(false);
        if (res.status === 200) {
          setActivities(await res.json());
        } else {
          setActivities([]);
          setError(true);
          let extraMessage = '';
          if (res.status === 403) {
            extraMessage = `You should request access to this page, providing your SSO subject [${auth.user_details?.sub || ''}]`;
          }
          setErrorMessage(`response status code was [${res.status} ${res.statusText}] ${extraMessage}`);
        }
      })
      .catch((reason) => {
        setLoading(false);
        setError(true);
        setErrorMessage(`${reason}`);
      });
  }, []);

  useEffect(() => {
    if (activities) {
      const completed = activities.sort((a, b) => {
        const invert = sortDirection === 'desc' ? -1 : 1;
        return a[sortProperty] > b[sortProperty] ? 1 * invert : -1 * invert;
      });
      setSorted(completed);
    } else {
      setSorted([]);
    }
  }, [activities, sortProperty, sortDirection]);

  if (error) {
    return <pre>{errorMessage}</pre>;
  }

  if (loading) {
    return <Spinner />;
  }

  return (
    <table className="activities">
      <thead>
        <tr>
          <SortingTableHeader
            title={'Activity ID'}
            propertyName={'activity_id'}
            sortDirection={sortDirection}
            sortProperty={sortProperty}
            setSortDirection={setSortDirection}
            setSortProperty={setSortProperty}
          />
          <SortingTableHeader
            title={'Activity Type'}
            propertyName={'activity_type'}
            sortDirection={sortDirection}
            sortProperty={sortProperty}
            setSortDirection={setSortDirection}
            setSortProperty={setSortProperty}
          />
          <SortingTableHeader
            title={'Activity Subtype'}
            propertyName={'activity_subtype'}
            sortDirection={sortDirection}
            sortProperty={sortProperty}
            setSortDirection={setSortDirection}
            setSortProperty={setSortProperty}
          />
          <SortingTableHeader
            title={'Activity Date'}
            propertyName={'activity_date'}
            sortDirection={sortDirection}
            sortProperty={sortProperty}
            setSortDirection={setSortDirection}
            setSortProperty={setSortProperty}
          />
        </tr>
      </thead>
      <tbody>
        {sorted.map((activity) => (
          <tr key={activity.id}>
            <td>
              <NavLink to={`/activities/${activity.id}`}>{activity.id}</NavLink>
            </td>
            <td>{activity.type}</td>
            <td>{activity.subtype}</td>
            <td>{activity.date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
export default ActivitiesList;
