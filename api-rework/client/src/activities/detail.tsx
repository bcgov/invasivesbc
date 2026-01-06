import React, { useEffect, useState } from 'react';
import { API_URL } from 'constants';
import { NavLink, useParams } from 'react-router';
import Spinner from 'activities/spinner';
import JSONViewer from 'activities/json_viewer';
import './activities.scss';

const Tab = ({ tab, setTab, title, tabName }) => {
  return (
    <li className={tab === tabName ? 'active' : ''}>
      <a
        onClick={() => {
          setTab(tabName);
        }}>
        {title}
      </a>
    </li>
  );
};

const ActivitiesDetail: React.FC = () => {
  const { id } = useParams();

  const [loading, setLoading] = useState<boolean>(true);
  const [serial, setSerial] = useState(0);

  const [djangoModel, setDjangoModel] = useState(undefined);
  const [pydanticModel, setPydanticModel] = useState(undefined);
  const [legacyModel, setLegacyModel] = useState(undefined);
  const [migrationStatus, setMigrationStatus] = useState(undefined);

  const [tab, setTab] = useState('django');

  useEffect(() => {
    setLoading(true);
    const promises = [
      fetch(`${API_URL}/activities/${id}`).then(async (res) => {
        setDjangoModel(await res.json());
      }),
      fetch(`${API_URL}/activities/${id}/pydantic`).then(async (res) => {
        setPydanticModel(await res.json());
      }),
      fetch(`${API_URL}/activities/${id}/legacy`).then(async (res) => {
        setLegacyModel(await res.json());
      }),
      fetch(`${API_URL}/activities/${id}/migration_status`).then(async (res) => {
        setMigrationStatus(await res.json());
      })
    ];
    Promise.all(promises).then(() => {
      setLoading(false);
    });
  }, [id, serial]);

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="activities-detail">
      <NavLink to={'/'}>← Activities List</NavLink>
      <h4>{id}</h4>

      <nav className={'tabs'}>
        <ul>
          <Tab tab={tab} setTab={setTab} tabName={'legacy'} title={'Legacy Model'} />
          <Tab tab={tab} setTab={setTab} tabName={'pydantic'} title={'Pydantic Model'} />
          <Tab tab={tab} setTab={setTab} tabName={'django'} title={'Final Django Model'} />
          <Tab tab={tab} setTab={setTab} tabName={'migration'} title={'Migration Status'} />
          <li>
            <a
              onClick={() => {
                setSerial(serial + 1);
              }}>
              Reload Data
            </a>
          </li>
        </ul>
      </nav>
      <div className={`${tab === 'django' ? 'active' : 'inactive'} tab`}>
        <JSONViewer
          data={djangoModel}
          helpText={
            'Serialized JSON form of the model in Django. You can use this to verify that it was copied correctly.'
          }
          diffCandidates={[
            {
              data: pydanticModel,
              title: 'Pydantic Model'
            },
            {
              data: legacyModel,
              title: 'Legacy Model'
            }
          ]}
        />
      </div>
      <div className={`${tab === 'pydantic' ? 'active' : 'inactive'} tab`}>
        <JSONViewer
          data={pydanticModel}
          helpText={
            'This is the activity in the intermediate format generated with Pydantic, used as the intermediate step in producing the final Django model. It is not saved anywhere in this format -- this is generated live from the legacy data. You can use this to check that the intermediate format looks reasonable.'
          }
          diffCandidates={[
            {
              data: djangoModel,
              title: 'Django Model'
            },
            {
              data: legacyModel,
              title: 'Legacy Model'
            }
          ]}
        />
      </div>
      <div className={`${tab === 'legacy' ? 'active' : 'inactive'} tab`}>
        <JSONViewer
          data={legacyModel}
          helpText={'This is the activity exactly as it exists in the legacy database (served up fresh, by Django)'}
          diffCandidates={[
            {
              data: pydanticModel,
              title: 'Pydantic Model'
            },
            {
              data: djangoModel,
              title: 'Django Model'
            }
          ]}
        />
      </div>
      <div className={`${tab === 'migration' ? 'active' : 'inactive'} tab`}>
        <JSONViewer
          data={migrationStatus}
          diffCandidates={[]}
          helpText={
            'Information about the migration output for this activity (if there were errors, they would be displayed here)'
          }
        />
      </div>
    </div>
  );
};

export default ActivitiesDetail;
