import { CircularProgress } from '@material-ui/core';
import { ActivityType } from 'constants/activities';
import { DatabaseContext } from 'contexts/DatabaseContext';
import Monitoring from 'pages/form/Monitoring';
import Observation from 'pages/form/Observation';
import Treatment from 'pages/form/Treatment';
import React, { useContext, useEffect, useState } from 'react';

interface IMapProps {
  classes?: any;
}

const ActivityPage: React.FC<IMapProps> = (props) => {
  const databaseContext = useContext(DatabaseContext);

  const [doc, setDoc] = useState(null);

  useEffect(() => {
    const getActivityData = async () => {
      if (!databaseContext.database) {
        return;
      }

      const appState = await databaseContext.database.find({ selector: { _id: 'AppState' } });

      if (!appState || !appState.docs || !appState.docs.length) {
        return;
      }

      const doc = await databaseContext.database.find({ selector: { _id: appState.docs[0].activeActivity } });

      setDoc(doc.docs[0]);
    };

    getActivityData();
  }, [databaseContext]);

  if (!doc) {
    return <CircularProgress />;
  }

  switch (doc.type) {
    case ActivityType.OBSERVATION:
      return <Observation activity={doc} classes={props.classes} />;
    case ActivityType.TREATMENT:
      return <Treatment activity={doc} classes={props.classes} />;
    case ActivityType.MONITORING:
      return <Monitoring activity={doc} classes={props.classes} />;
  }
};

export default ActivityPage;
