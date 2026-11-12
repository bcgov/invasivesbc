import React, { useContext, useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router';
import { AuthContext } from 'client';
import { CONFIG } from 'configuration';
import Spinner from 'activities/spinner';

const IAPPDetail: React.FC = () => {
  const { id } = useParams();

  const [loading, setLoading] = useState<boolean>(true);
  const [anyError, setAnyError] = useState<boolean>(false);
  const [serial, setSerial] = useState(0);

  const [data, setData] = useState(undefined);

  const { state: auth } = useContext(AuthContext);

  useEffect(() => {
    setLoading(true);
    setAnyError(false);

    const promises = [
      fetch(`${CONFIG.API_URL}/iapp/${id}`, {
        headers: {
          Authorization: `Bearer ${auth.token}`
        }
      }).then(async (res) => {
        if (res.status === 200) {
          setData(await res.json());
        } else {
          setAnyError(true);
        }
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
    <div className="iapp-detail">
      <NavLink to={'/'}>← IAPP List</NavLink>
      <h4>{id}</h4>

      {anyError && (
        <pre className={'warning'}>
          Errors occurred while loading components of this record. Check network log for details.
        </pre>
      )}

      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
};

export default IAPPDetail;
