import React from 'react';

import './Records.css';
import { Route, useHistory } from 'react-router';
import { Activity } from './Record';
import { useSelector } from 'react-redux';
import { selectActivity } from 'state/reducers/activity';
import { selectIappsite } from 'state/reducers/iappsite';

export const Records = (props) => {
  const sets = [1, 2, 3, 4, 5, 6, 7, 8];

  const history = useHistory();
  const activityState = useSelector(selectActivity);
  const IAPPState = useSelector(selectIappsite);
  const navToRecord = (id: string, isIAPP?: boolean) => {
    if (isIAPP) {
      return () => history.push('/Records/IAPP:' + id);
    }
    return () => history.push('/Records/Activity:' + id);
  }



  return (
    <div className="records__container">
      <Route path="/Records/Activity:id" component={Activity} />
      <Route
        path="/Records"
        exact={true}
        render={(props) => (
          <>
            {sets.map((set) => {
              return (
                <div
                  key={set}
                  onClick={() => {
                    history.push('/Records/Activity:' + activityState.activity?.id);
                  }}
                  className="records__set"
                />
              );
            })}
          </>
        )}
      />
    </div>
  );
};
