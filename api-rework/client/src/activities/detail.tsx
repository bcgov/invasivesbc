import React, {useContext, useEffect, useState} from 'react';
import {API_URL} from 'constants';
import {NavLink, Outlet, Route, Routes, useParams} from 'react-router';
import Spinner from 'activities/spinner';
import JSONViewer from 'activities/json_viewer';
import './activities.scss';
import {AuthContext} from 'client';
import FormViewer from './form-viewer/FormViewer';
import * as api from 'ninja-schema/api';


const ActivitiesDetail: React.FC = () => {
  const { id } = useParams();

  const [loading, setLoading] = useState<boolean>(true);
  const [anyError, setAnyError] = useState<boolean>(false);
  const [serial, setSerial] = useState(0);

  const [djangoModel, setDjangoModel] = useState(undefined);
  const [pydanticModel, setPydanticModel] = useState(undefined);
  const [legacyModel, setLegacyModel] = useState(undefined);
  const [migrationStatus, setMigrationStatus] = useState(undefined);
  const [ninjaModel, setNinjaModel] = useState<undefined | api.ActivityOut>(undefined);

  const { state: auth } = useContext(AuthContext);

  useEffect(() => {
    setLoading(true);
    setAnyError(false);

    const promises = [
      fetch(`${API_URL}/activities/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      }).then(async (res) => {
        if (res.status === 200) {
          setDjangoModel(await res.json());
        } else {
          setAnyError(true);
        }
      }),
      fetch(`${API_URL}/activities/${id}/pydantic`, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      }).then(async (res) => {
        if (res.status === 200) {
          setPydanticModel(await res.json());
        } else {
          setAnyError(true);
        }
      }),
      fetch(`${API_URL}/activities/${id}/legacy`, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      }).then(async (res) => {
        if (res.status === 200) {
          setLegacyModel(await res.json());
        } else {
          setAnyError(true);
        }
      }),
      fetch(`${API_URL}/ninja/activities/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      }).then(async (res) => {
        if (res.status === 200) {
          setNinjaModel(await res.json());
        } else {
          setAnyError(true);
        }
      }),
      fetch(`${API_URL}/activities/${id}/migration_status`, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      }).then(async (res) => {
        if (res.status === 200) {
          setMigrationStatus(await res.json());
        } else {
          setAnyError(true);
        }
      })
    ];
    Promise.all(promises).then(() => {
      setLoading(false);
    });
  }, [id, serial]);

  const rerunImport = () => {
    fetch(`${API_URL}/activities/${id}/migrate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${auth.token}`
      }
    }).then(() => {
      setSerial(serial + 1);
    });
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div className="activities-detail">
      <NavLink to={'/'}>← Activities List</NavLink>
      <h4>{id}</h4>

      {anyError && (
        <pre className={'warning'}>
          Errors occurred while loading components of this record. Check network log for details.
        </pre>
      )}

      <nav className={'tabs'}>
        <ul>
          <NavLink className={({isActive}) => (isActive ? 'active' : 'inactive')} to={`/activities/${id}/legacy`}>Legacy Model</NavLink>
          <NavLink className={({isActive}) => (isActive ? 'active' : 'inactive')} to={`/activities/${id}/pydantic`}>Pydantic Model</NavLink>
          <NavLink className={({isActive}) => (isActive ? 'active' : 'inactive')} to={`/activities/${id}/django`}>Final Django Model</NavLink>
          <NavLink className={({isActive}) => (isActive ? 'active' : 'inactive')} to={`/activities/${id}/ninja`}>Ninja Model</NavLink>
          <NavLink className={({isActive}) => (isActive ? 'active' : 'inactive')} to={`/activities/${id}/migration`}>Migration Status</NavLink>
          <NavLink className={({isActive}) => (isActive ? 'active' : 'inactive')} to={`/activities/${id}/form`}>View as Form</NavLink>
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
      <Outlet/>
      <Routes>
        <Route path="/django" element={<JSONViewer
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
          />}/>
        <Route path="/pydantic" element={        <JSONViewer
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
        />}/>
        <Route path="/legacy" element={        <JSONViewer
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
        />}/>
        <Route path="/migration" element={<>
          <button
            onClick={() => {
              rerunImport();
            }}>
            Rerun Import
          </button>
          <JSONViewer
            data={migrationStatus}
            diffCandidates={[]}
            helpText={
              'Information about the migration output for this activity (if there were errors, they would be displayed here)'
            }
          /></>}/>
        <Route path="/ninja" element={
          <>
            <p>{ninjaModel?.access_description} </p>
          <JSONViewer data={ninjaModel} diffCandidates={[]} helpText={'Type-safe ninja model'} />
          </>
        }/>
        <Route path="/form" element={   <FormViewer formData={djangoModel} />}/>
        <Route index element={<p>click a link for details</p>}/>
      </Routes>

    </div>
  );
};

export default ActivitiesDetail;
