import React, { useEffect, useState } from 'react';
import { API_URL } from 'constants';
import './activities.scss';
import Spinner from 'activities/spinner';
import { NavLink } from 'react-router';

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

  useEffect(() => {
    fetch(`${API_URL}/activities`).then(async (res) => {
      setLoading(true);
      setActivities(await res.json());
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const completed = activities.sort((a, b) => {
      const invert = sortDirection === 'desc' ? -1 : 1;
      return a[sortProperty] > b[sortProperty] ? 1 * invert : -1 * invert;
    });
    setSorted(completed);
  }, [activities, sortProperty, sortDirection]);

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
