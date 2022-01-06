import { IAPPSite } from 'components/points-of-interest/IAPP/IAPP-Site';
import { useDataAccess } from 'hooks/useDataAccess';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

export const ReferenceIAPPSitePage: React.FC = (props) => {
  const urlParams: { id: string } = useParams();
  const dataAccess = useDataAccess();
  let arr = [];

  const [poi, setPOI] = useState(null);

  useEffect(() => {
    if (urlParams) {
      arr.push(urlParams.id);
    }
  }, [urlParams]);

  useEffect(() => {
    if (!poi) {
      fetchPOI();
    } else {
      console.log('poi', poi);
    }
  }, [poi]);

  const fetchPOI = async () => {
    const poiData = await dataAccess.getPointsOfInterest({ point_of_interest_ids: arr });
    setPOI(poiData.rows[0]);
  };

  return (
    <div id="iapp_site" style={{ marginTop: 30 }}>
      {poi && <IAPPSite record={poi} />}
    </div>
  );
};
