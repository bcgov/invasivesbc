import { IAPPSite } from 'components/points-of-interest/IAPP/IAPP-Site';
import { useDataAccess } from 'hooks/useDataAccess';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router';

export const ReferenceIAPPSitePage: React.FC = (props) => {
  const urlParams: { id: string } = useParams();
  const dataAccess = useDataAccess();

  const [poi, setPOI] = useState(null);

  useEffect(() => {
    const fetchPOI = async () => {
      const poiData = await dataAccess.getPointsOfInterest({ iappSiteID: urlParams.id, isIAPP: true });
      setPOI(poiData.result[0]);
    };

    if (!poi) {
      fetchPOI();
    }
  }, [poi, dataAccess, urlParams.id]);

  return (
    <div id="iapp_site" style={{ marginTop: 30, marginBottom: 30 }}>
      {poi && <IAPPSite record={poi} />}
    </div>
  );
};
